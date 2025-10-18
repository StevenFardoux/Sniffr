import { Schema, model, ObjectId } from "mongoose";
import { IDevices } from "../interfaces";

/**
 * Device model schema definition
 * @property {string} IMEI - Unique identifier for the device
 * @property {string} Name - Device name
 * @property {number} BatterieStatus - Current battery level
 * @property {Date} DateLastConn - Last connection timestamp
 * @property {Date} DateRegister - Registration date
 * @property {ObjectId[]} Group_Id - References to associated groups
 */
const DevicesSchema = new Schema<IDevices>({
    IMEI: {
        type: String,
        required: true,
        unique: true
    },
    Name: {
        type: String
    },
    BatterieStatus: {
        type: Number
    },
    DateLastConn: {
        type: Date
    },
    DateRegister: {
        type: Date
    },
    Group_Id: {
        type: [Schema.Types.ObjectId], 
        ref: "Group"
    }
});

const Device = model<IDevices>('Device', DevicesSchema);

export default Device;