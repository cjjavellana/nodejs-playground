import { EventEmitter } from "events";
import { Application } from "express";
import { Socket } from "socket.io";
import io from "socket.io";
import { Metrics } from "../data";
import { Namespace } from "./Namespace";

export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ws: io.Server = app.locals.io;

    const adminNs = new Namespace(app, ws, "/admin");
    adminNs.onConnect((socket: Socket) => {
        socket.send("Welcome to the /admin namespace");
    }).build();

    eventEmitter.on("systemUtilization", (metrics: Metrics) => {
        adminNs.emit("systemUtilization", metrics);
    });
};
