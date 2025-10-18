import { Router, Request, Response, NextFunction } from "express";
import { reply, parser } from "../utils";
import { Device } from "../DB";
import { z } from "zod";
import { IDevices } from "src/interfaces";

const router = Router();

/**
 * @swagger
 * /iotbyuser:
 *   get:
 *     summary: Recover the user's IoT devices
 *     tags: [Device]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of IoT devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 devices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/iotbyuser", async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        return reply(res, 401, { error: "Unauthorized" });
    }

    try {
        const result = await Device.find({
            Group_Id: { $in: req.user.Group_Id },
        }).populate("Group_Id");

        return reply(res, 200, { devices: result });
    } catch (err: any) {
        return reply(res, 500, { error: err.message });
    }
});

/**
 * @swagger
 * /updateIot:
 *   patch:
 *     summary: Update IoT device information
 *     tags: [Device]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeviceInput'
 *     responses:
 *       200:
 *         description: Device successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: string
 *                   example: IoT successfully updated
 *       400:
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The IoT name must contain at least 3 characters
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Device not found
 */
router.patch(
    "/updateIot",
    parser(
        z.object({
            IMEI: z.string(),
            Name: z
                .string()
                .min(3, "The IoT name must contain at least 3 characters"),
            Group_Id: z.array(z.string()),
        })
    ),
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            return reply(res, 401, { error: "Unauthorized" });
        }

        try {
            const response = await Device.findOneAndUpdate(
                { IMEI: req.body.IMEI },
                { Name: req.body.Name, Group_Id: req.body.Group_Id }
            );

            if (!response) {
                return reply(res, 404, { error: "Device not found" });
            }

            reply(res, 200, { return: "IoT successfully updated" });
        } catch (err: any) {
            reply(res, 400, { error: err.message });
        }
    }
);

/**
 * @swagger
 * /paringIoT:
 *   patch:
 *     summary: Pair an IoT device to a user
 *     tags: [Device]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PairDeviceInput'
 *     responses:
 *       200:
 *         description: IoT device paired successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: string
 *                   example: IoT Successfully paired
 *       400:
 *         description: Invalid data, device not found, or device already paired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Device not found
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Connection error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Connection error
 */
router.patch(
    "/paringIot",
    parser(
        z.object({
            IMEI: z.string(),
            Name: z
                .string()
                .min(3, "The IoT name must contain at least 3 characters"),
            Group_Id: z.array(z.string()),
        })
    ),
    async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            return reply(res, 401, { error: "Unauthorized" });
        }

        try {
            const device = await Device.findOne({ IMEI: req.body.IMEI });

            console.log("", device);

            if (device === null) {
                return reply(res, 400, { error: "Device not found" });
            }

            if (device.Group_Id.length !== 0) {
                return reply(res, 400, { error: "Device already paired" });
            }

            device.Name = req.body.Name;
            device.Group_Id = req.body.Group_Id;
            device.save().then((saved: any): void => {
                if (saved === device) {
                    console.log("ok", device);
                    return reply(res, 200, {
                        return: "IoT Successfully paired",
                    });
                } else {
                    console.log("err", device);
                    return reply(res, 500, { error: "Connection error" });
                }
            });
        } catch (err: any) {
            return reply(res, 400, { error: err.message });
        }
    }
);

export default router;
