import events, { EventEmitter } from "events";
import { Application } from "express";
import io, { Socket } from "socket.io";

export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ioServer: io.Server = app.locals.io;

    ioServer.on("connection", (socket: Socket) => {
        // connection is up, let's add a simple simple event
        socket.on("message", (message: string) => {
            console.log("received: %s", message);
            socket.send(`Hello, you sent -> ${message}`);
        });

        // send immediatly a feedback to the incoming connection
        console.log(socket);
        socket.send("Hi there, I am a WebSocket server");
    });

    /**
     * Subscribe to 'OnUploadCompleteEvent' event to broadcast the message through
     * websockets
     */
    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        ioServer.emit("OnUploadCompleteEvent", message);
    });

};
