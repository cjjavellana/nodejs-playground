import { Application } from "express";
import io, { Socket } from "socket.io"

export const register = (app: Application) => {
    const ioServer: io.Server = app.locals.io;
    ioServer.use((socket: Socket, next) => {
        console.log(socket);
        next();
    });
};