import { Application, NextFunction, Request, Response } from "express";
import { authClient } from "../services/auth";

export const register = (app: Application) => {

    /**
     * API used by health check monitoring services
     */
    app.get("/api/v1/healthcheck", (req: Request, res: Response, _: NextFunction) => {
        res.send("I'm alive and ready to gooooo... ");
    });
};
