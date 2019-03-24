import dotenv from "dotenv";
import express from "express";
import http from "http";
import io from "socket.io";
import WebSocket, { AddressInfo } from "ws";
import bodyParser from "body-parser";
import * as redis from "./redis";
import * as apiv1 from "./routes/v1/auth";
import * as socketio from "./websockets";
import * as mocks from "./routes/mocks/mocks";
import * as parsers from "./parsers";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

parsers.register(app);
app.locals.io = io(server);
socketio.register(app);
apiv1.register(app);
redis.register(app);

// only on dev mode - exclude this in production build
mocks.register(app);

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello World!\n" );
} );

// start our server
server.listen(process.env.SERVER_PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});
