import { Router, Request, Response, NextFunction } from "express";
import { User } from "../DB";
import { parser, reply } from "../utils";
import { z } from "zod";
import passport from "../config/passport";
import { IUsers } from "../interfaces";

const router = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
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
 */
router.get("/me", (req: Request, res: Response): void => {
    if (!req.user) {
        return reply(res, 401, { error: "Unauthorized" });
    }

    // Parse all cookies from the request headers
    const cookies = req.headers.cookie
        ?.split("; ")
        .reduce((acc: Record<string, string>, cookie: string) => {
            const [key, value] = cookie.split("=");
            acc[key] = value;
            return acc;
        }, {});

    const userResponse = {
        id: req.user._id,
        Username: req.user.Username,
        Email: req.user.Email,
        Role: req.user.Role,
        Group_Id: req.user.Group_Id,
        Token: (cookies && cookies["connect.sid"]) || "", // Use the parsed cookie value or an empty string if not found
    };

    return reply(res, 200, { user: userResponse });
});

export default router;
