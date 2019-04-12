import { Application } from "express";
import log4js, { LoggingEvent } from "log4js";

export const register = (app: Application) => {
    log4js.addLayout("json", (config: any) => {
        return (logEvent: LoggingEvent) => {
            return JSON.stringify(logEvent) + config.separator;
        };
    });

    log4js.configure({
        appenders: {
            out: { type: "stdout", layout: { type: "json", separator: "," } }
        },
        categories: {
            default: { appenders: ["out"], level: "info" }
        }
    });

    const logger = log4js.getLogger("default");
    app.locals.logger = logger;
    app.use(log4js.connectLogger(logger, {
        format: (req, res, format) => {
            const reqId = req.headers["x-request-id"] || "";
            return format(":remote-addr - -" + reqId + " \":method :url HTTP/:http-version\"" +
                " :response-time :status :content-length");
        },
        level: "auto",
    }));
};
