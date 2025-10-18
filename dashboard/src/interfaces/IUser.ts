/**
 * Interface for user account objects
 */
export default interface IUser {
    /** Unique user identifier */
    id: number;
    /** User's chosen username */
    Username: string;
    /** User's email address */
    Email: string;
    /** User's role level (numeric representation) */
    Role: number;
    /** ID of the group this user belongs to */
    Group_Id: number;
    /** Authentication token for API requests */
    Token: string;
}
