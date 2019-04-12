import { EventEmitter } from "events";
import { Application } from "express";
import { Jwt } from "./crypto";

import * as adminNs from "./websockets/adminns";
import * as defaultNs from "./websockets/defaultns";

/**
 * The main module handling websocket communication.
 *
 * Dependencies
 * ================
 * 1. Must be initialized after redis
 *
 * @param app
 */
export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;

    eventEmitter.on("jwtReady", (jwt: Jwt) => {
        defaultNs.register(app, jwt);
        adminNs.register(app);
    });
};
