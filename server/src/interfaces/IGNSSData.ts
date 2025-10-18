import IIOTData from "./IIOTData";

export default interface IGNSSData extends IIOTData {
    d: {
        latitude: number; // Latitude in degrees
        Longitude: number; // Longitude in degrees
    };
}
