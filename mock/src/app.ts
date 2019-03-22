import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { AddressInfo } from "net";
import * as authRoutes from "./auth/routes";

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;
const server = http.createServer(app);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello World!\n" );
});

authRoutes.register(app);

// start our server
server.listen(process.env.SERVER_PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});
