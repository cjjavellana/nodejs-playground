import { Application, NextFunction, Request, Response } from "express";

export const register = (app: Application) => {

    /**
     * API used by health check monitoring services
     */
    app.post("/auth/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        res.send("I'm alive and ready to gooooo... ");
    });

};
