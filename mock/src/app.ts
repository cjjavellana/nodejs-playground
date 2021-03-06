import bodyParser from "body-parser";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import express, { Request, Response } from "express";
import http from "http";
import { AddressInfo } from "net";
import path from "path";
import * as amqp from "./amqp";
import * as authRoutes from "./auth/routes";
import * as configRoutes from "./config/routes";
import * as dataRoutes from "./data/routes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const router = express.Router();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello World!\n");
});

app.locals.eventEmitter = new EventEmitter();

dataRoutes.register(app);
authRoutes.register(app);
configRoutes.register(app);
amqp.register(app);

// start our server
server.listen(process.env.SERVER_PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});
