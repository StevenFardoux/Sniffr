import { Schema, model } from "mongoose";
import { IGroups } from "../interfaces";

/**
 * Group model schema definition
 * @property {string} Name - Unique group name
 * @property {string} Description - Group description
 */
const GroupsSchema = new Schema<IGroups>({
    Name: {
        type: String,
        required: true,
        unique: true
    },
    Description: {
        type: String
    },
});

const Group = model<IGroups>('Group', GroupsSchema);

export default Group;