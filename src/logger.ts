import { Application } from "express";
import log4js, { Logger, LoggingEvent } from "log4js";

export const register = (app: Application) => {
    const logger = log4js.getLogger("logstash");

    addJSONLayout();
    configureLog4js();
    connectLog4jsToExpress(app, logger);
};

const addJSONLayout = () => {
    log4js.addLayout("json", (config: any) => {
        return (logEvent: LoggingEvent) => {
            return JSON.stringify(logEvent);
        };
    });
};

const connectLog4jsToExpress = (app: Application, logger: Logger) => {
    app.use(log4js.connectLogger(logger, {
        format: (req, res, format) => {
            const reqId = req.headers["x-request-id"] || "";
            return format(":remote-addr - - " + reqId + " \":method :url HTTP/:http-version\"" +
                " :response-time :status :content-length");
        },
        level: "auto",
    }));
};

const configureLog4js = () => {
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
};
