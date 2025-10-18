import { Schema, model } from "mongoose";
import { IData } from "../interfaces";

/**
 * Data model schema definition
 * @property {ObjectId} IoT_Id - Reference to the Device model
 * @property {Mixed} ValueReceive - Can be string, number, array, etc.
 * @property {string} TypeValue - Type of the received value
 */
const DataSchema = new Schema<IData>({
    IoT_Id: {
        type: Schema.Types.ObjectId, 
        ref: "Device",
        required: true
    },
    ValueReceive: {
        type: Schema.Types.Mixed,
        required: true,
    },
    TypeValue: {
        type: String,
        required: true
    }
},
{
    timestamps: { createdAt: true, updatedAt: false}
}
);

const Data = model<IData>('Data', DataSchema);

export default Data;