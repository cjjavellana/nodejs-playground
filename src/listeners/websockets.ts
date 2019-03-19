import { Application } from "express";
import io, { Socket } from "socket.io";
import WebSocket from "ws";

export const register = (app: Application) => {
    const wss = app.locals.io;

    wss.on("connection", (socket: Socket) => {
        // connection is up, let's add a simple simple event
        socket.on("message", (message: string) => {
            console.log(app);
            console.log("received: %s", message);
            socket.send(`Hello, you sent -> ${message}`);
        });

        // send immediatly a feedback to the incoming connection
        console.log(socket);
        socket.send("Hi there, I am a WebSocket server");
    });

};
