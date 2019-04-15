import bodyParser from "body-parser";
import express from "express";
import http from "http";
import log4js from "log4js";
import io from "socket.io";
import * as amqp from "./amqp";
import * as crypto from "./crypto";
import * as eventEmitter from "./emitters";
import * as dotenv from "./loadenv";
import * as logConfig from "./logger";
import * as middleware from "./middleware";
import * as notifications from "./notifications";
import * as parsers from "./parsers";
import * as redis from "./redis";
import * as apiv1 from "./routes/v1/auth";
import * as websockets from "./websockets";
dotenv.config();

const app = express();
logConfig.register(app);

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

app.get("/", (req, res) => {
    res.send("Hello World");
});

module.exports = app;
