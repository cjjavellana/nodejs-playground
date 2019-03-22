import { Application, NextFunction, Request, Response } from "express";
import { authClient } from "../services/auth";

export const register = (app: Application) => {

    /**
     * API used by health check monitoring services
     */
    app.get("/api/v1/healthcheck", (req: Request, res: Response, _: NextFunction) => {
        res.send("I'm alive and ready to gooooo... ");
    });

    /**
     * Accepts a username & password delegates call to an auth service
     */
    app.post("/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        const username = req.body.username;
        const pwd = req.body.password;
        authClient.authenticate('111', username, pwd, (error, resp, body) => {
            console.log('Hello %s', body);
        })
    });
};
