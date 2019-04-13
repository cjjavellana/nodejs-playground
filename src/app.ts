import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import log4js from "log4js";
import io from "socket.io";
import { AddressInfo } from "ws";
import * as amqp from "./amqp";
import * as crypto from "./crypto";
import * as eventEmitter from "./emitters";
import * as logger from "./logger";
import * as middleware from "./middleware";
import * as notifications from "./notifications";
import * as parsers from "./parsers";
import * as redis from "./redis";
import * as mocks from "./routes/mocks/mocks";
import * as apiv1 from "./routes/v1/auth";
import * as websockets from "./websockets";

dotenv.config();

const app = express();
logger.register(app);

const logstashLogger = log4js.getLogger("logstash");
const server = http.createServer(app);
app.locals.io = io(server);

middleware.register(app);
eventEmitter.register(app);
amqp.register(app);
crypto.register(app);
parsers.register(app);
apiv1.register(app);
redis.register(app);
notifications.register(app);
websockets.register(app);
// only on dev mode - exclude this in production build
mocks.register(app);

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello World!\n" );
} );

// start our server
server.listen(process.env.SERVER_PORT || 8999, () => {
    logstashLogger.info(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});
