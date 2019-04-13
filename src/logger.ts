import { Application } from "express";
import log4js, { LoggingEvent } from "log4js";
import * as stringutils from "./utils/strings";

export const register = (app: Application) => {
    const logger = log4js.getLogger();

    addJSONLayout();
    configureLog4js();
};

const addJSONLayout = () => {
    log4js.addLayout("json", (config: any) => {
        return (logEvent: LoggingEvent) => {
            // copy the content of the data array as we are going to modify it when
            // resolving the message later on
            const data = [...logEvent.data];

            // merge logEvent.context (if any)
            // into our log object
            const logObj = {
                ...{
                    category: logEvent.categoryName,
                    level: (logEvent.level as any).levelStr,
                    message: stringutils.resolve(data)
                }, ...logEvent.context
            };

            return JSON.stringify(logObj);
        };
    });
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
            console: { appenders: ["console"], level: "info" },
            default: { appenders: ["logstash", "console"], level: "info" }
        }
    });
};
