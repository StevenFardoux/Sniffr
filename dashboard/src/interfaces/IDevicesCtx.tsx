import IDevices from "./IDevices";
import IGroup from "./IGroup";

/**
 * Interface for the IoT Devices context providing device management functionality
 */
export default interface IDevicesCtx {
    /** Array of IoT devices */
    iots: IDevices[];
    /** Function to update an existing IoT device */
    updateIot: (IMEI: string, Name: string, Groups: string[]) => Promise<any>;
    /** Function to pair a new IoT device with user account */
    pairingIot: (IMEI: string, Name: string, Groups: string[]) => Promise<any>;
}