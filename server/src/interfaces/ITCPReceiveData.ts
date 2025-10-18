import IGNSSData from "./IGNSSData";
import IIOTData from "./IIOTData";
import IBATTERYData from "./IBATTERYData";

export default interface ITCPReceiveData {
    /**
     * @type {number}
     * @description Number of data sent
     */
    c: number;


    /**
     * @type {string}
     * @description IMEI of the device
     */
    i: string;

    /**
     * @type {number}
     * @description Upttime of the device in seconds
     */
    t: number;

    /**
     * @type {IGNSSData[] | IIOTData[] |IBATTERYData[]}
     * @description Array of GNSS or other IoT data
     */
    it: IGNSSData[] | IIOTData[] | IBATTERYData[]; // Array of GNSS or other IOT data

    /**
     * @type {string}
     * @description IMEI
     */
    imei: string;
}
