import { Application, NextFunction, Request, Response } from "express";
import io, { Socket } from "socket.io";
import uuid from "uuid";

export const register = (app: Application) => {
    registerRESTAdvice(app);
    registerWebSocketAdvice(app);
};

const registerRESTAdvice = (app: Application) => {
    app.use(aroundAdvice);
};

const registerWebSocketAdvice = (app: Application) => {
    const ioServer: io.Server = app.locals.io;
    ioServer.use((socket: Socket, next) => {
        console.log(socket);
        next();
    });
};

const aroundAdvice = (req: Request, resp: Response, next: NextFunction) => {
    const requestStartTime = Date.now();
    const requestId = req.headers["X-Request-Id"] || uuid.v4();

    console.log("[Request Start] %s %s", requestId, req.url);

    resp.on("finish", () => {
        const elapsedTimeInMillis = Date.now() - requestStartTime;
        console.log("[Request End] %s %sms", requestId, elapsedTimeInMillis);
    });

    next();
};
