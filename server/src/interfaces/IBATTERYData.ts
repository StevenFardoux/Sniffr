import IIOTData from "./IIOTData";

export default interface IBATTERYData extends IIOTData {
    d: {
        b: number; // Battery level
    };
}
