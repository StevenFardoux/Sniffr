import { Router, Request, Response, NextFunction } from "express";
import { Group, User } from "../DB";
import { parser, reply } from "../utils";
import { z } from "zod";
import passport from "../config/passport";
import { IUsers } from "../interfaces";

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: string
 *                   description: Success message
 *                   example: Account successfully created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: The password must contain at least 8 characters
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Email already used for another account
 */
router.post(
    "/register",
    parser(
        z.object({
            Username: z
                .string()
                .min(3, "The username must contain at least 3 characters"),
            Email: z.string().email(),
            Password: z
                .string()
                .min(8, "The password must contain at least 8 characters")
                .regex(
                    /[A-Z]/,
                    "The password must contain at least 1 capital letter"
                )
                .regex(
                    /[a-z]/,
                    "The password must contain at least 1 lower case letter"
                )
                .regex(/\d/, "The password must contain at least 1 digit")
                .regex(
                    /[@$!%*?&^#~()_\[\]|\\:<>./?]/,
                    "The password must contain at least 1 special character"
                ),
        })
    ),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await User.create({
                Username: req.body.Username,
                Email: req.body.Email,
                Password: req.body.Password,
                Role: 1,
            });
            
            const group = await Group.create({
                Name: req.body.Username,
            });

            user.Group_Id.push(group._id);
            await user.save();

            reply(res, 200, { return: "Account successfully created" });
        } catch (err: any) {
            /*
             * 11000 code = duplicate data in mongo collection
             */
            if (err.code === 11000) {
                reply(res, 409, {
                    error: "Email already used for another account",
                });
            } else {
                reply(res, 400, { error: err.message });
            }
        }
    }
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: string
 *                   description: Success message
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 expireDate:
 *                    type: string
 *                    format: date-time
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Error during authentication
 */
router.post(
    "/login",
    parser(
        z.object({
            Email: z.string().email() /* Email must be a valid email */,
            Password: z.string() /* Password must be a string */,
        })
    ),
    (req: Request, res: Response, next: NextFunction): void => {
        /**
         * Passport authentication middleware
         * It uses the local strategy defined in passport.ts
         */
        passport.authenticate(
            "local",
            (err: Error | null, user: any, info: { message: string }): void => {
                if (err) {
                    return reply(res, 500, {
                        error: "Error during authentication",
                    });
                }

                if (!user) {
                    return reply(res, 401, {
                        error: info.message || "Invalid credentials",
                    });
                }

                /**
                 * req.logIn is a passport method that establishes a login session
                 * It takes the user object and a callback function
                 */
                req.logIn(user, (err): void => {
                    if (err) {
                        return reply(res, 500, { error: "Error during login" });
                    }

                    const userResponse = {
                        id: user._id,
                        Username: user.Username,
                        Email: user.Email,
                        Role: user.Role,
                        Group_Id: user.Group_Id,
                        Token: req.headers.cookie?.split(";").find(c => c.trim().startsWith("connect.sid="))?.split("=")[1],
                    };

                    return reply(res, 200, {
                        return: "Login successful",
                        user: userResponse,
                        expireDate: new Date(
                            new Date().getTime() + 1000 * 60 * 60 * 24 * 30
                        ),
                    });
                });
            }
        )(req, res, next);
    }
);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout from the application
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: string
 *                   description: Success message
 *                   example: Logout successful
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Error during logout
 */
router.post("/logout", (req: Request, res: Response): void => {
    req.logout((err): void => {
        if (err) {
            return reply(res, 500, { error: "Error during logout" });
        }

        reply(res, 200, { return: "Logout successful" });
    });
});

export default router;
