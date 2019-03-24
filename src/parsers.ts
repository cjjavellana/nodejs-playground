import bodyParser from "body-parser";
import { Application } from "express";

/**
 * Registers the request body parsers.
 *
 * Parses application/x-www-form-urlencoded and application/json
 *
 * @param app
 */
export const register = (app: Application) => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
};
