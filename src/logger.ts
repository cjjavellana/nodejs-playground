import { Application } from "express";
import log4js, { LoggingEvent } from "log4js";

export const register = (app: Application) => {
    log4js.addLayout("json", (config: any) => {
        return (logEvent: LoggingEvent) => {
            return JSON.stringify(logEvent);
        };
    });

    log4js.configure({
        appenders: {
            console: { type: "console" },
            /* tslint:disable:object-literal-sort-keys */
            logstash: {
                type: "@log4js-node/rabbitmq",
                host: process.env.RABBITMQ_HOST,
                port: process.env.RABBITMQ_PORT,
                username: process.env.RABBITMQ_USER,
                password: process.env.RABBITMQ_PASSWORD,
                exchange: "logs",
                mq_type: "direct",
                routing_key: "logstash",
                durable: true,
                layout: { type: "json", separator: "," }
            }
            /* tslint:enable:object-literal-sort-keys */
        },
        categories: {
            default: { appenders: ["console"], level: "info" },
            logstash: { appenders: ["logstash", "console"], level: "info" }
        }
    });

    const logger = log4js.getLogger("logstash");
    app.locals.logger = logger;
    app.use(log4js.connectLogger(logger, {
        format: (req, res, format) => {
            const reqId = req.headers["x-request-id"] || "";
            return format(":remote-addr - - " + reqId + " \":method :url HTTP/:http-version\"" +
                " :response-time :status :content-length");
        },
        level: "auto",
    }));
};
