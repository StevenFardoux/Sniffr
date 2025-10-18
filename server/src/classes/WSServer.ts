import { WebSocketServer, WebSocket } from "ws";
import { randomUUID, UUID } from "crypto";
import { print } from "../utils";
import { IUsers } from "../interfaces";
import { User } from "../DB";

/**
 * Interface for WebSocket client with additional properties
 */
export interface WSClient extends WebSocket {
    /** Unique identifier for the WebSocket client */
    id?: UUID;
    /** User associated with the WebSocket client */
    user?: IUsers;
}

/**
 * WSServer class that extends the WebSocketServer class with user authentication and session management
 */
class WSServer extends WebSocketServer {
    protected _clients: WSClient[] = [];
    protected _events: Map<string, Function> = new Map();
    protected _sessionHandler: any;
    protected _store: any;

    /**
     * Constructor for the WSServer class
     * @param options - Configuration options for the WebSocket server
     */
    constructor(options: { port: number }) {
        super(options);

        super.on("connection", (ws: WSClient): void => {
            this._events.get("connection")?.(ws);
            ws.id = this.randomUUID();

            ws.on("error", (err: Error): void => {
                this._events.get("error")?.(err);
                print(`WebSocket client (${ws.id}) error: ${err.message}`);
                this.kill(ws);
            });

            ws.on("message", async (data: Buffer): Promise<void> => {
                try {
                    const message = JSON.parse(data.toString());

                    if (!message || typeof message !== "object") {
                        throw new Error("Invalid message format");
                    }

                    switch (message.type) {
                        case "connection":
                            if (message.token) {
                                let sessionId: string | null = null;

                                // Check if it's a cookie (starts with s%3A)
                                if (message.token.startsWith("s%3A")) {
                                    const cookieIdMatch =
                                        message.token.match(/s%3A(.*)\./);
                                    if (cookieIdMatch) {
                                        sessionId = cookieIdMatch[1];
                                    }
                                } else {
                                    // If it's not a cookie, consider it directly as session ID
                                    sessionId = message.token;
                                }

                                if (sessionId) {
                                    console.log(
                                        `WebSocket client (${ws.id}) connected with session ID: ${sessionId}`
                                    );
                                    this._store.get(
                                        sessionId,
                                        (err: Error, session: any): void => {
                                            if (err) {
                                                print(
                                                    `Error retrieving session for WebSocket client (${ws.id}): ${err.message}`
                                                );
                                                return;
                                            }

                                            if (session) {
                                                ws.user = session.user;
                                                console.log(
                                                    `WebSocket client (${ws.id}) authenticated as: ${session.passport.user}`
                                                );
                                                this.setUser(
                                                    session.passport.user,
                                                    ws
                                                );
                                            } else {
                                                console.log(
                                                    `WebSocket client (${ws.id}) session not found`
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                            break;
                        case "logout":
                            if (ws.user) {
                                print(
                                    `WebSocket client (${ws.id}) logging out user: ${ws.user.Username}`
                                );
                                this._store.destroy(
                                    ws.id as string,
                                    (err: Error): void => {
                                        if (err) {
                                            print(
                                                `Error destroying session for WebSocket client (${ws.id}): ${err.message}`
                                            );
                                        } else {
                                            print(
                                                `WebSocket client (${ws.id}) session destroyed`
                                            );
                                            ws.user = undefined;
                                        }
                                    }
                                );
                            }
                        default:
                            break;
                    }

                    this._events.get("message")?.(ws, message);
                } catch (err: any) {
                    print(`Error parsing WebSocket message: ${err.message}`);
                }
            });

            ws.on("close", (): void => {
                print(`WebSocket client (${ws.id}) disconnected`);
                this.kill(ws);
            });

            print(`WebSocket client (${ws.id}) connected`);

            // Send welcome message to client
            ws.send(
                JSON.stringify({
                    message: "Hello from WebSocket server!",
                    yourId: ws.id,
                })
            );

            this._clients.push(ws);
        });

        super.on("close", (): void => {
            this._events.get("close")?.();
            print("WebSocket server closed");
        });

        super.on("error", (err: Error): void => {
            this._events.get("error")?.(err);
            console.error("WebSocket server error:", err);
        });
    }

    /**
     * Kills a client by its UUID or WSClient instance
     * @param {UUID | WSClient} target - The UUID or WSClient instance to kill
     * @returns {void}
     */
    public kill(target: UUID | WSClient): void {
        const uuid =
            target instanceof WebSocket ? (target?.id as UUID) : target;
        const client = this._clients.find((c) => c.id === uuid);

        if (!client) {
            print("[WARN] WebSocket client not found");
            return;
        }

        client.terminate();
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
     * Broadcast a message to all connected clients
     * @param {any} data - The data to broadcast
     * @param {UUID[]} [include] - Optional client ID to include from broadcast
     * @returns {void}
     */
    public broadcast(data: any, include?: UUID[] | undefined): void {
        const message = JSON.stringify(data);
        this._clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                client?.id !== undefined &&
                include !== undefined &&
                include.includes(client.id)
            ) {
                client.send(message);
            }
        });
    }

    /**
     * Generate a random UUID for a new client
     * @returns {UUID} - A unique UUID for the client
     */
    private randomUUID(): UUID {
        let uuid: UUID = randomUUID();

        while (this._clients.some((client) => client.id === uuid)) {
            uuid = randomUUID();
        }

        return uuid;
    }

    /**
     * Set session handler for the WebSocket server
     * @param {any} sessionHandler - The session handler to set
     */
    public setSessionHandler(sessionHandler: any): void {
        this._sessionHandler = sessionHandler;
        print("WebSocket session handler set");
    }

    /**
     * Set store for the WebSocket server
     * @param {any} store - The store to set
     */
    public setStore(store: any): void {
        this._store = store;
        print("WebSocket store set");
    }

    /**
     * Set user for the WebSocket server
     * @param {number} userId - The user ID to set
     * @param {WSClient} client - The WebSocket client instance
     * @returns {void}
     */
    public setUser(userId: number, client: WSClient): void {
        if (!userId || !client) {
            print("Invalid user ID or client");
            return;
        }

        User.findById(userId)
            .then((user: IUsers | null) => {
                if (user) {
                    client.user = user;
                    print(`WebSocket user set: ${user?.Username}`);
                } else {
                    print(`WebSocket user with ID ${userId} not found`);
                }
            })
            .catch((err: Error) => {
                print(`Error setting WebSocket user: ${err.message}`);
            });
    }

    /**
     * Get the current user of the WebSocket server
     * @param {WSClient} client - The WebSocket client instance
     * @returns {IUsers | null} The current user or null if not set
     */
    public getUser(client: WSClient): IUsers | null {
        if (client.user) {
            return client.user;
        } else {
            print("WebSocket user not set");
            return null;
        }
    }

    /**
     * Get clients per user ID
     * @param {string} userId - The user ID to get clients for
     * @returns {WSClient[]} Array of WSClient instances for the user
     */
    public getClientsByUserId(userId: string): WSClient[] {
        return this._clients.filter((client) => {
            return client.user?._id?.toString() === userId;
        });
    }
}

export default WSServer;
