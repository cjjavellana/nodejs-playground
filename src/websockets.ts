import events, { EventEmitter } from "events";
import { Application } from "express";
import io, { Socket } from "socket.io";

class AuthToken {
    public token: string;
}

export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ioServer: io.Server = app.locals.io;

    ioServer.on("connection", (socket: Socket) => {
        socket.on("authenticate", (authMessage: string) => {
            // perform authentication of the presented token here
            const authToken = JSON.parse(authMessage) as AuthToken;

            if (authToken.token === "bbb") {
                socket.on("message", (message: string) => {
                    console.log("received: %s", message);
                    socket.send(`Hello, you sent -> ${message}`);
                });

                socket.send("Hi there, I am a WebSocket server");
            } else {
                socket.send("I'm sorry, I do not know you");
                socket.disconnect(true);
            }
        });
    });

    /**
     * Subscribe to 'OnUploadCompleteEvent' event to broadcast the message through
     * websockets
     */
    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        ioServer.emit("OnUploadCompleteEvent", message);
    });

};
