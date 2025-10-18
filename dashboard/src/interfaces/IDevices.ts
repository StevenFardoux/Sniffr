import { IDataGNSS } from "./IDataGNSS";
import IGroup from "./IGroup";

/**
 * Interface for IoT device objects
 */
export default interface IDevices {
    /** Unique database identifier */
    _id: string;
    /** International Mobile Equipment Identity - unique device identifier */
    IMEI: string;
    /** User-friendly device name */
    Name: string;
    /** Current battery level percentage (0-100) */
    BatterieStatus: number;
    /** Date and time of last connection */
    DateLastConn: Date;
    /** Date and time when device was registered */
    DateRegister: Date;
    /** GPS data associated with the device */
    gpsData?: IDataGNSS[];
    /** Array of groups this device belongs to */
    Group_Id: IGroup[];
}
