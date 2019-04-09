import { EventEmitter } from "events";
import { Application } from "express";
import io, { Packet, Socket } from "socket.io";
import socketioJwt from "socketio-jwt";
import { Jwt } from "./crypto";
import { Metrics, OutGoingWebSocketMessage } from "./data";
import { Namespace } from "./websockets/namespace";
import { NewConnectionDesk } from "./websockets/newconnectiondesk";

/**
 * The main module handling websocket communication.
 *
 * Dependencies
 * ================
 * 1. Must be initialized after redis
 *
 * @param app
 */
export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ws: io.Server = app.locals.io;

    eventEmitter.on("jwtReady", (jwt: Jwt) => {
        initDefaultNamespace(jwt);
        initAdminNamespace(jwt);
    });

    const initDefaultNamespace = (jwt: Jwt) => {
        const newConnectionDesk = new NewConnectionDesk(app);
        const defaultNs = new Namespace(app, ws);

        // validate client connecting to the default namespace
        defaultNs.onConnect(socketioJwt.authorize({
            decodedPropertyName: "decoded_token",
            secret: jwt.getPublicKey()
        })).onClientAuthenticated((socket: Socket) => {
            newConnectionDesk.instructClientToConnectToSecGroupNamespace(socket);
        }).on("stockPriceRequest", (socket: Socket, stockPriceRequest: any) => {
            eventEmitter.on("stockPriceRequest", stockPriceRequest);
        }).build();

        eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
            defaultNs.emit("OnUploadCompleteEvent", message);
        });
    };

    const initAdminNamespace = (jwt: Jwt) => {
        const adminNs = new Namespace(app, ws, "/admin");
        adminNs.onConnect((socket: Socket) => {
            socket.send("Welcome to the /admin namespace");
        }).build();

        eventEmitter.on("systemUtilization", (metrics: Metrics) => {
            adminNs.emit("systemUtilization", metrics);
        });
    };
};
