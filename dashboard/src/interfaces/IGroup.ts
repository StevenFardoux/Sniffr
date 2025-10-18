/**
 * Interface for device group objects
 */
export default interface IGroup {
    /** Unique database identifier */
    _id: string;
    /** Group name */
    Name: string;
    /** Detailed description of the group purpose */
    Description: string;
}
