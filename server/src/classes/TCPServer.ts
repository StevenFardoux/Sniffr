import { Server, Socket } from "net";
import TCPClient from "./TCPClient";
import { randomUUID, UUID } from "crypto";
import { print } from "../utils";
import { encode, decode } from "../../cbor";

/**
 * TCPServer class that extends the Server class with client management capabilities
 */
class TCPServer extends Server {
    protected _clients: TCPClient[] = [];
    protected _events: Map<string, Function> = new Map();

    /**
     * Constructor for the TCPServer class
     * Initializes the server and sets up event handling for client connections
     */
    constructor() {
        super();

        super.on("connection", (socket: TCPClient): void => {
            this._events.get("connection")?.(socket);
            socket.id = this.randomUUID();

            socket.on("error", (err: Error): void => {
                this._events.get("error")?.(err);
                if (err.message === "read ECONNRESET") {
                    print(`Client (${socket.id}) disconnected`);
                } else {
                    print(`Client (${socket.id}) error: ${err.message}`);
                }

                this.kill(socket);
            });

            socket.on("data", (data: Buffer): void => {
                this._events.get("data")?.(socket, data);
            });

            print(
                `Client (${socket.id}) connected from ${socket.remoteAddress}:${socket.remotePort}`
            );

            socket.write(
                encode({ message: "Hello from server!", yourId: socket.id })
            );

            this._clients.push(socket);
        });

        super.on("close", (): void => {
            this._events.get("close")?.();
            print("Server closed");
        });

        super.on("listening", (): void => {
            this._events.get("listening")?.();
        });

        super.on("error", (err: Error): void => {
            this._events.get("error")?.(err);
            console.error("Server error:", err);
        });
    }

    /**
     * Kills a client by its UUID or TCPClient instance
     * @param {UUID | TCPClient} target - The UUID or TCPClient instance to kill
     * @returns {void}
     */
    public kill(target: UUID | TCPClient): void {
        const uuid = target instanceof Socket ? (target?.id as UUID) : target;
        const client = this._clients.find((c) => c.id === uuid);

        if (!client) {
            print("[WARN] Client not found");
            return;
        }

        client.end();
        this._clients = this._clients.filter((c) => c.id !== uuid);
    }
    /**
     * Add event listeners to the server
     * @param {string} event - The event name
     * @param {Function} listener - The event listener function
     * @returns {this} Returns the server instance for method chaining
     */
    public on(event: string, listener: Function): this {
        if (!this._events.has(event)) {
            this._events.set(event, listener);
        }

        return this;
    }

    /**
     * Generate a random UUID for a new client
     * @returns {UUID} A unique UUID for the client
     */ private randomUUID(): UUID {
        let uuid: UUID = randomUUID();

        while (this._clients.some((client) => client.id === uuid)) {
            uuid = randomUUID();
        }

        return uuid;
    }
}

export default TCPServer;
