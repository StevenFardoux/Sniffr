import MongoStore from "connect-mongo";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

let store: MongoStore;

/**
 * Utility function to print timestamped messages to console
 * @param {...any[]} args - Arguments to print
 * @returns {void}
 */
export const print = (...args: any[]): void => {
    const time = new Date();
    console.log(`[${time.toISOString()}] ${args.join(" ")}`);
};

/**
 * Utility function to send JSON response with status code
 * @param {Response} res - Express response object
 * @param {number} httpCode - HTTP status code
 * @param {any} data - Data to send in response
 * @returns {void}
 */
export const reply = (res: Response, httpCode: number, data: any): void => {
    res.status(httpCode).json(data);
};

/**
 * Creates a parser middleware for request body validation using Zod schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware function
 */
export const parser = (schema: z.ZodSchema) => {
    return function createParser(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            reply(res, 400, { error: result.error });
        } else {
            next();
        }
    };
};

/**
 * Gets or creates a MongoDB store instance for session management
 * @returns {MongoStore} MongoDB store instance
 */
export const getStore = (): MongoStore => {
    if (!store) {
        store = MongoStore.create({
            mongoUrl: "mongodb://localhost:27017/ess_company",
            collectionName: "sessions",
        });
    }

    return store;
};
