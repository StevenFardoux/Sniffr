import {ObjectId, Mixed } from 'mongoose';

/*
* ValueReceive can be string, number, array; etc...
* refer to addition of data on test.ts for more examples
* ------------------------------------------------------
* ObjectId refers to the mongo automatic id
*/
export interface IData {
    IoT_Id: ObjectId,
    ValueReceive: Mixed,
    TypeValue: String,
    timestamps: Date
}

export interface IDataGNSS extends Omit<IData, 'ValueReceive'> {
    ValueReceive: {
        latitude: number; // Latitude in degrees
        Longitude: number; // Longitude in degrees
    };
}