import { Application, NextFunction, Request, Response } from "express";

export const register = (app: Application) => {
    app.use(aroundAdvice);
};

const aroundAdvice = (req: Request, resp: Response, next: NextFunction) => {
    console.log("Starting Request %s", req.url);

    resp.on("finish", () => {
        console.log("Request Completed %s", req.url);
    });

    next();
};
