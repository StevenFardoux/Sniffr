import { Router, Request, Response } from "express";
import { reply, parser } from "../utils";
import { Data, Group, Device } from "../DB";
import { IDevices, IData } from "src/interfaces";
import { z } from "zod";
import IGNSSData from "src/interfaces/IGNSSData";

const router = Router();

/**
 * @swagger
 * /dataPerGroups:
 *   get:
 *     summary: Get the number of data per group per day over a week
 *     tags: [Data]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       groups:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             data:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error while retrieving data"
 */
router.get(
    "/dataPerGroups",
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            return reply(res, 401, { error: "Unauthorized" });
        }

        try {
            /*
             * Calculate date from 7 days ago
             */
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);

            /*
             * Get user's groups
             */
            const groups = await Group.find({
                _id: { $in: req.user.Group_Id },
            });

            /*
             * Find devices per groups
             */
            const devices = await Device.find({
                Group_Id: { $in: req.user.Group_Id },
            });
            const deviceIds = devices.map((device) => device._id);

            /*
             * Aggregation query to count data by group and day
             */
            const result = await Data.aggregate([
                /*
                 * Filter data from the last 7 days and user's devices
                 */
                {
                    $match: {
                        createdAt: { $gte: oneWeekAgo },
                        IoT_Id: { $in: deviceIds },
                    },
                },
                /*
                 * Lookup to get device information
                 */
                {
                    $lookup: {
                        from: "devices",
                        localField: "IoT_Id",
                        foreignField: "_id",
                        as: "device",
                    },
                },
                /*
                 * Unwind device array
                 */
                {
                    $unwind: "$device",
                },
                /*
                 * Unwind Group_Id array
                 */
                {
                    $unwind: "$device.Group_Id",
                },
                /*
                 * Count data by group and day
                 */
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                },
                            },
                            groupId: "$device.Group_Id",
                        },
                        count: { $sum: 1 },
                    },
                },
                /*
                 * Sort by date and group name
                 */
                {
                    $sort: {
                        "_id.date": 1,
                        "_id.groupId": 1,
                    },
                },
                /*
                 * Group by date and create array of groups
                 */
                {
                    $group: {
                        _id: "$_id.date",
                        groups: {
                            $push: {
                                name: "$_id.groupId",
                                data: "$count",
                            },
                        },
                    },
                },
                /*
                 * Format final result
                 */
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        groups: 1,
                    },
                },
            ]);

            /*
             * Replace group IDs with group names and sort groups by name
             */
            const formattedResult = result.map((dateGroup) => ({
                ...dateGroup,
                groups: dateGroup.groups
                    .map((group: any) => {
                        const groupObj = groups.find(
                            (g) => g._id.toString() === group.name.toString()
                        );

                        if (!groupObj) return undefined;

                        return {
                            name: groupObj ? groupObj.Name : group.name,
                            data: group.data,
                        };
                    })
                    .filter((g: any) => g !== undefined),
            }));

            return reply(res, 200, { return: formattedResult });
        } catch (error: any) {
            console.error("Erreur:", error.message);
            return reply(res, 500, { error: error.message });
        }
    }
);

/**
 * @swagger
 * /batteryHistory:
 *   get:
 *     summary: Get battery level history for all IoT devices of the user's groups
 *     tags: [Data]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       devices:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             battery:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error while retrieving data"
 */
router.get(
    "/batteryHistory",
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            return reply(res, 401, { error: "Unauthorized" });
        }

        try {
            /*
             * Calculate start date (6 months before today)
             */
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            startDate.setHours(0, 0, 0, 0);

            /*
             * Find devices from user's groups
             */
            const devices = await Device.find({
                Group_Id: { $in: req.user.Group_Id },
            })
                .sort({ DateLastConn: -1 })
                .limit(5);
            /*
             * Aggregation to get battery history
             */
            const result = await Data.aggregate([
                /*
                 * Filter battery data from user's devices
                 */
                {
                    $match: {
                        IoT_Id: { $in: devices.map((device) => device._id) },
                        TypeValue: "BATTERY",
                        createdAt: { $gte: startDate },
                    },
                },
                /*
                 * Join with devices to get names
                 */
                {
                    $lookup: {
                        from: "devices",
                        localField: "IoT_Id",
                        foreignField: "_id",
                        as: "device",
                    },
                },
                {
                    $unwind: "$device",
                },
                /*
                 * Group by date and device
                 */
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                },
                            },
                            deviceId: "$IoT_Id",
                            deviceName: "$device.Name",
                        },
                        battery: { $last: "$ValueReceive" },
                    },
                },
                /*
                 * Sort by date and device name
                 */
                {
                    $sort: {
                        "_id.date": 1,
                        "_id.deviceName": 1,
                    },
                },
                /*
                 * Group by date
                 */
                {
                    $group: {
                        _id: "$_id.date",
                        devices: {
                            $push: {
                                name: "$_id.deviceName",
                                battery: "$battery",
                            },
                        },
                    },
                },
                /*
                 * Format final result
                 */
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        devices: 1,
                    },
                },
                /*
                 * Sort final result by date
                 */
                {
                    $sort: {
                        date: 1,
                    },
                },
            ]);

            return reply(res, 200, { return: result });
        } catch (error: any) {
            console.error("Error:", error.message);
            return reply(res, 500, { error: error.message });
        }
    }
);

/**
 * @swagger
 * /iot/gps/{imei}:
 *   get:
 *     summary: Retrieve GPS data for a specific IoT device by IMEI
 *     tags: [Data]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: IMEI of the IoT device
 *     responses:
 *       200:
 *         description: GPS data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GNSSData'
 *       400:
 *         description: IMEI is required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/iot/gps/:imei",
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            return reply(res, 401, { error: "Unauthorized" });
        }

        const user = req.user;
        const imei = req.params.imei;
        if (!imei) {
            return reply(res, 400, { error: "IMEI is required" });
        }

        try {
            const device: IDevices = (
                await Device.aggregate([
                    { $match: { IMEI: imei } },
                    {
                        $lookup: {
                            from: "datas",
                            as: "gpsData",
                            localField: "_id",
                            foreignField: "IoT_Id",
                            pipeline: [
                                { $match: { TypeValue: "GPS" } },
                                // {
                                //     $group: {
                                //         _id: {
                                //             longitude: "$ValueReceive.Longitude",
                                //             latitude: "$ValueReceive.latitude"
                                //         },
                                //         ValueReceive: { $first: "$ValueReceive" }
                                //     }
                                // },
                            ],
                        },
                    },
                ])
            )[0];

            if (!device) {
                return reply(res, 404, { error: "Device not found" });
            }

            // Vérifier si l'utilisateur a accès au dispositif via ses groupes
            const hasAccess = device.Group_Id.some((groupId) =>
                user.Group_Id.includes(groupId)
            );

            if (!hasAccess) {
                return reply(res, 404, { error: "Device not found" });
            }

            const gpsData = device.gpsData
                ?.map((data, index) => {
                    if (
                        device.gpsData &&
                        device.gpsData[index + 1] &&
                        device.gpsData[index + 1].ValueReceive.Longitude ==
                            data.ValueReceive.Longitude &&
                        device.gpsData[index + 1].ValueReceive.latitude ==
                            data.ValueReceive.latitude
                    )
                        return null;
                    return data?.ValueReceive;
                })
                .filter((data) => data !== null);

            return reply(res, 200, gpsData || []);
        } catch (error: any) {
            console.error(error.message);
            return reply(res, 500, { error: "Internal server error" });
        }
    }
);

export default router;
