import { Socket } from "net";
import { UUID } from "crypto";
import { print } from "../utils";

/**
 * Timeout in milliseconds before attempting to restart the connection
 */
const RESTART_TIMEOUT = 1000;

/**
 * TCPClient class that extends the Socket class with automatic reconnection capabilities
 */
class TCPClient extends Socket {
    protected _id: UUID | undefined;

    /**
     * Constructor for the TCPClient class
     * Initializes the socket and sets up error handling with automatic reconnection
     */
    constructor() {
        super();
        this._id = undefined;

        this.on("error", (err: Error): void => {
            if (err.message === "read ECONNRESET") {
                print(`Server disconnected`);
            } else if (err.message.startsWith("connect ECONNREFUSED")) {
                print(`Server not found`);
            } else {
                print(`Server error: ${err.message}`);
            }

            print(`Restarting client in ${RESTART_TIMEOUT / 1000} seconds...`);
            setTimeout((): void => {
                this.connect({
                    port: this.remotePort ?? 4567,
                    host: this.remoteAddress ?? "localhost",
                });
            }, RESTART_TIMEOUT);
        });
    }

    /**
     * Getter for the client ID
     * @returns {UUID | undefined} The unique identifier of the client
     */
    public get id(): UUID | undefined {
        return this._id;
    }

    /**
     * Setter for the client ID
     * @param {UUID} id - The unique identifier to set for the client
     */
    public set id(id: UUID) {
        this._id = id;
    }
}

export default TCPClient;
