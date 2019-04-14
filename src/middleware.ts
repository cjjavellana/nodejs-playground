import { Application, NextFunction, Request, Response } from "express";
import log4js from "log4js";
import io, { Socket } from "socket.io";
import uuid from "uuid";

export const register = (app: Application) => {
    registerRESTAdvice(app);
    registerWebSocketAdvice(app);
};

const registerRESTAdvice = (app: Application) => {
    const logger = log4js.getLogger("middleware");
    app.use([(req: Request, resp: Response, next: NextFunction) => {
        const requestId = req.headers["x-request-id"];
        if (!requestId) {
            req.headers["x-request-id"] = uuid.v4();
        }

        logger.info("[Request Start] %s %s", req.headers["x-request-id"], req.url);
        next();
    },
    log4js.connectLogger(logger, {
        format: (req, res, format) => {
            const reqId = req.headers["x-request-id"] || "no-request-id";
            return format("[Request Completed] :remote-addr - - " + reqId + " \":method :url HTTP/:http-version\"" +
                " :response-time :status :content-length");
        },
        level: "auto",
    })
    ]);
};

const registerWebSocketAdvice = (app: Application) => {
    const ioServer: io.Server = app.locals.io;

    ioServer.use((socket: Socket, next) => {
        next();
    });
};
