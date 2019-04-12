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

    app.locals.logger = log4js.getLogger("app");
};
