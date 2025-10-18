/**
 * Interface for alert notification objects
 */
export default interface IAlert {
    /** The message content to display */
    message: string;
    /** The type of alert determining its visual styling and semantic meaning */
    type: "success" | "error" | "info" | "warning";
}
