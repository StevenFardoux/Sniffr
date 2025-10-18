import IUser from "./IUser";

/**
 * Interface for the Authentication context providing user authentication functionality
 */
export default interface IAuthCtx {
    /** Currently authenticated user or null if not authenticated */
    user: IUser | null;
    /** Boolean indicating if user is currently authenticated */
    isAuthenticated: boolean;
    /** Expiration date of the current authentication token */
    expireDate: Date | null;
    /** Function to authenticate a user with email and password */
    login: (email: string, password: string) => Promise<IUser>;
    /** Function to log out the current user */
    logout: () => Promise<void>;
    /** Function to register a new user account */
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    /** Authentication cookie value */
    cookie: string | null;
}
