import events from "events";
import { Application } from "express";
import { Logger } from "log4js";

export const register = (app: Application) => {
    const logger: Logger = app.locals.logger;

    logger.info("Event Emitter Initialized");
    app.locals.eventEmitter = new events.EventEmitter();
};
