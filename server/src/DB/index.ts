import Group from "./GroupsModel";
import Data from "./DataModel";
import Device from "./DevicesModel";
import User from "./UsersModel";
 
/**
 * Refreshes indexes for all models to ensure schema changes are applied
 */
export const refreshIndexes = async () => {
    await Group.syncIndexes();
    await Data.syncIndexes();
    await Device.syncIndexes();
    await User.syncIndexes();
}

/*
* Grouping of models in a single export file 
*/
export { Group, Data, Device, User };