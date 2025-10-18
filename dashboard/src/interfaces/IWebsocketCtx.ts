/**
 * Interface for the WebSocket context providing real-time communication functionality
 */
export default interface IWebsocketCtx {
    /** Boolean indicating if WebSocket is currently connected */
    isConnected: boolean;
    /** Function to establish WebSocket connection to specified URL */
    connect: (url: string) => void;
    /** Function to close the WebSocket connection */
    disconnect: () => void;
    /** Function to send a message through the WebSocket */
    send: (message: string | object) => void;
    /** The most recently received message from the WebSocket */
    lastMessage: any | null;
    /** Current WebSocket error if any */
    error: Error | null;
}
