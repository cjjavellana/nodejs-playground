import events from "events";
import { Application } from "express";

export const register = (app: Application) => {
    app.locals.eventEmitter = new events.EventEmitter();
};
