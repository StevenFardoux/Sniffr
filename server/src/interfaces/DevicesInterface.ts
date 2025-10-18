import { Types } from 'mongoose';
import { IData, IDataGNSS } from './DataInterface';

/*
* ObjectId refers to the mongo automatic id
*/
export interface IDevices {
    _id: Types.ObjectId;
    IMEI: string,
    Name: string,
    BatterieStatus: number;
    DateLastConn: Date,
    DateRegister: Date,
    gpsData?: IDataGNSS[]; // Optional GPS data associated with the device
    Group_Id: Types.ObjectId[];
}