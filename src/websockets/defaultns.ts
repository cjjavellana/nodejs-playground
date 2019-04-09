import { EventEmitter } from "events";
import { Application } from "express";
import io, { Socket } from "socket.io";
import socketioJwt from "socketio-jwt";
import { Jwt } from "../crypto";
import { StockPriceResponse } from "../data";
import { Namespace } from "./Namespace";
import { NewConnectionDesk } from "./NewConnectionDesk";

/**
 * The default namespace handler
 *
 * @param app
 */
export const register = (app: Application, jwt: Jwt) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ws: io.Server = app.locals.io;

    const newConnectionDesk = new NewConnectionDesk(app);
    const defaultNs = new Namespace(app, ws);

    // ~ Incoming messages here =================================

    // validate client connecting to the default namespace
    defaultNs.onConnect(socketioJwt.authorize({
        decodedPropertyName: "decoded_token",
        secret: jwt.getPublicKey()
    })).onClientAuthenticated((socket: Socket) => {
        newConnectionDesk.instructClientToConnectToSecGroupNamespace(socket);
    }).on("stockPriceRequest", (socket: Socket, stockPriceRequest: any) => {
        eventEmitter.on("stockPriceRequest", stockPriceRequest);
    }).build();

    // ~ Outgoing messages here ==================================

    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        defaultNs.emit("OnUploadCompleteEvent", message);
    }).on("stockPriceResponse", (response: StockPriceResponse) => {
        defaultNs.to(response.username).emit("stockPriceResponse", response);
    });

};
