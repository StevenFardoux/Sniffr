import IGroup from "./IGroup";

/**
 * Interface for the Groups context providing group management functionality
 */
export default interface IGroupsCtx {
    /** Array of available device groups */
    groups: IGroup[];
}
