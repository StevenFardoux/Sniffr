import TCPClient from "./src/classes/TCPClient";
import { print } from "./src/utils";
import { encode, decode } from "./cbor";

/**
 * Initializing TCP client
 */
const client = new TCPClient();

/**
 * Handling TCP client connection
 */
client.on("connect", () => {
    print("Connected to server");
    client.write(encode({ message: "Hello from client!" }));
});

client.on("data", (data: Buffer) => {
    print("Received data from server:");
    console.table(decode(data));
});

/**
 * Connecting to the TCP server
 */
client.connect({
    port: 4567,
    host: "localhost",
});
