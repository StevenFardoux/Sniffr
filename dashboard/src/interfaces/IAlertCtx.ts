import IAlert from "./IAlert";

/**
 * Interface for the Alert context providing alert management functionality
 */
export default interface IAlertCtx {
    /** Function to add a new alert notification */
    addAlert: (
        message: string,
        type: "success" | "error" | "info" | "warning",
        duration?: number
    ) => void;
    /** Array of currently active alerts */
    alerts: IAlert[];
}
