import { Router, Request, Response, NextFunction } from "express";
import { reply } from "../utils";
import { Group } from "../DB";

const router = Router();

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Retrieve the list of all groups
 *     tags: [Group]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
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
router.get("/groups", async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        return reply(res, 401, { error: "Unauthorized" });
    }

    try {
        const result = await Group.find();
        return reply(res, 200, { groups: result });
    } catch (err: any) {
        return reply(res, 500, { error: err.message });
    }
});

export default router;
