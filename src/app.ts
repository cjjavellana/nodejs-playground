import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import io from "socket.io";
import { AddressInfo } from "ws";
import * as amqp from "./amqp";
import * as crypto from "./crypto";
import * as eventEmitter from "./emitters";
import * as ioMiddleware from "./iomiddleware";
import * as filters from "./middleware";
import * as notifications from "./notifications";
import * as parsers from "./parsers";
import * as redis from "./redis";
import * as mocks from "./routes/mocks/mocks";
import * as apiv1 from "./routes/v1/auth";
import * as socketio from "./websockets";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.locals.io = io(server);

eventEmitter.register(app);
amqp.register(app);
filters.register(app);
parsers.register(app);
apiv1.register(app);
redis.register(app);
crypto.register(app);
notifications.register(app);
socketio.register(app);
ioMiddleware.register(app);
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
