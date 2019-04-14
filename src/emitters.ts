import events from "events";
import { Application } from "express";
import log4js, { Logger } from "log4js";

export const register = (app: Application) => {
    const logger: Logger = log4js.getLogger("emitter");
    logger.info("Event Emitter Initialized");
    app.locals.eventEmitter = new events.EventEmitter();
};
