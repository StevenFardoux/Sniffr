import Express, { Application } from "express";
import bodyParser from "body-parser";
import TCPServer from "./src/classes/TCPServer";
import TCPClient from "./src/classes/TCPClient";
import mongoose from "mongoose";
import { getStore, print } from "./src/utils";
// import { encode, decode } from "./cbor";
// import { decode } from "cbor-x/decode";
import { decode, diagnose, encode } from "cbor2";
import { UUID } from "crypto";
import { refreshIndexes, Device, Data, User } from "./src/DB";
import routes from "./src/routes";
import session from "express-session";
import passport from "./src/config/passport";
import MongoStore from "connect-mongo";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger";
import WSServer, { WSClient } from "./src/classes/WSServer";
import cors from "cors";
import ITCPReceiveData from "src/interfaces/ITCPReceiveData";
import { IUsers } from "./src/interfaces";

/**
 * Initializing Express, TCP server and database connection
 */
const app: Application = Express();
const tcpServer = new TCPServer();
const wsServer = new WSServer({ port: 8080 });
const mongo = mongoose.connect("mongodb://localhost:27017/ess_company");

/**
 * WebSocket event handling
 */
wsServer.on("message", (client: WSClient, data: any): void => {
    // print("Received WebSocket message:");
    // print(data);
    // Broadcast message to all clients except sender
    // wsServer.broadcast(data, client.id);
});

/*
 * Refresh all mongo's collection if their structure has been modified
 */
refreshIndexes();

/**
 * Handling MongoDB connection
 */
mongo
    .then(async () => {
        print("MongoDB connected successfully");
    })
    .catch((err: Error) => {
        print("MongoDB connection error:", err.message);
    });

/**
 * Test Database collection
 */
// testDb();

app.use(bodyParser.json());

/**
 * Configure the session middleware
 * The session is stored in MongoDB using connect-mongo
 */

const sessionHandler = session({
    secret: "3yFg1nmUMoyKi94u8=3~yzms$kyew@!30NsfswV^EVo@5UX84T",
    resave: false,
    saveUninitialized: false,
    store: getStore(),
    cookie: {
        secure: false, // true if using https
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: false,
    },
});

app.use(sessionHandler);
wsServer.setSessionHandler(sessionHandler);
wsServer.setStore(getStore());

/**
 * Initialize passport middleware
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * CORS setup
 */
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:29209"],
        credentials: true,
    })
);

/**
 * API Routes
 */
app.use(routes);

/**
 * Swagger documentation setup
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Handling Express server
 */
app.get("/", (req, res) => {
    res.send("Hello World!");
});

/**
 * Handling TCP client connection
 */
tcpServer.on("data", async (client: TCPClient, data: Buffer) => {
    print(`Received data from client (${client.id}):`);

    let TEMP_STRING = "";
    for (let i = 0; i < data.length; i++) {
        TEMP_STRING += data[i].toString(16).padStart(2, "0") + " ";
    }

    print(`Data: ${TEMP_STRING}`);
    print(`Data length: ${data.length} bytes`);
    print("Decoded data:", decode(data));

    try {
        let tcpData: ITCPReceiveData | null = decode(data);

        if (tcpData) {
            /*
             * Sorts value type
             */

            if (tcpData.c > 0) {
                /*
                 * Creating device if doesn't exist in DB
                 */
                let deviceFind = await Device.findOne({ IMEI: tcpData.i });

                print("Device found:", deviceFind);
                if (deviceFind === null) {
                    deviceFind = await Device.create({
                        IMEI: tcpData.i,
                        BatterieStatus: 0,
                        DateLastConn: new Date().toISOString(),
                        DateRegister: new Date().toISOString(),
                    });

                    print("Device created:", deviceFind);
                    if (Device !== null) {
                        print("Device creation successful");
                    }
                } else {
                    await Device.updateOne(
                        { IMEI: tcpData.i },
                        { $set: { DateLastConn: new Date().toISOString() } }
                    );
                }

                tcpData.it.forEach(async (item) => {
                    switch (item.t) {
                        case "GNSS":
                            print("GNSS Data Received:");
                            print("GNSS Details:", item.d);
                            await Data.create({
                                IoT_Id: deviceFind._id,
                                ValueReceive: {
                                    Longitude: item.d.lo,
                                    latitude: item.d.la,
                                    Time: item.d.t,
                                },
                                TypeValue: "GPS",
                            });

                            // Trouver les utilisateurs qui ont accès au dispositif
                            const usersWithAccess = await User.find({
                                Group_Id: { $in: deviceFind.Group_Id },
                            });

                            var wsClientsUUIDs: UUID[] = [];

                            usersWithAccess.forEach((user: IUsers) => {
                                const wsClients = wsServer.getClientsByUserId(
                                    user._id.toString()
                                );
                                if (wsClients.length > 0) {
                                    wsClients.forEach((wsClient: WSClient) => {
                                        if (wsClient.id) {
                                            if (
                                                !wsClientsUUIDs.includes(
                                                    wsClient.id
                                                )
                                            ) {
                                                wsClientsUUIDs.push(
                                                    wsClient.id
                                                );
                                            }
                                        }
                                    });
                                }
                            });
                            // Envoyer le broadcast uniquement aux utilisateurs qui ont accès
                            wsServer.broadcast(
                                {
                                    type: "GPS",
                                    data: {
                                        imei: tcpData.i,
                                        longitude: item.d.lo,
                                        latitude: item.d.la,
                                        time: item.d.t,
                                    },
                                },
                                wsClientsUUIDs
                            );
                            break;
                        case "BATTERY":
                            print("Battery Data Received:");
                            print("Battery Details:", item.d);

                            await Data.create({
                                IoT_Id: deviceFind._id,
                                ValueReceive: item.d.b,
                                TypeValue: "BATTERY",
                            });

                            /*
                            * Update batteryStatus on device
                            */ 
                            await Device.updateOne(
                                { IMEI: tcpData.i },
                                { $set: { BatterieStatus: item.d.b } }
                            );

                            break;
                        case "Sensor":
                            print("Sensor Data Received:");
                            print("Sensor Details:", item.d);
                            break;
                        case "IOT":
                            print("IOT Data Received:");
                            print("IOT Details:", item.d);
                            break;
                        default:
                            break;
                    }
                });
            }
        } else {
            print("TCP Data:", tcpData);
        }
    } catch (err: any) {
        print(`Cbor decode error: ${err.message}`);
        return;
    }
});

tcpServer.on("listening", () => {
    print("TCP server is listening on port 4567");
});

/**
 * Listening part for TCP server and Express server
 */
tcpServer.listen(4567);

app.listen(3001, () => {
    print(`Server is running on port http://localhost:${3001}`);
    print(
        `Swagger documentation available at http://localhost:${3001}/api-docs`
    );
    print(`WebSocket server is running on port ws://localhost:8080`);
});