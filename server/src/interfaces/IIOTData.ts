export default interface IIOTData {
    /**
     * @type {string}
     * @description Type of the data, e.g., "GNSSData", "SensorData", etc.
     */
    t: "GNSS" | "BATTERY" | "Sensor" | "IOT";

    /**
     * @type {any}
     * @description Data payload containing the actual information.
     */
    d: any;
}
