import { IUsers } from '../../interfaces';

/**
 * This file is used to extend the Express Request object
 * to include the user object
 */
declare global {
    namespace Express {
        interface User extends IUsers { }

        interface Request {
            user?: IUsers;
        }
    }
} 