import { Application, NextFunction, Request, Response } from "express";
import jwt from "express-jwt";

export const register = (app: Application) => {

    app.post("/api/v1/stocks", jwt({
        secret: process.env.JWT_SECRET
    }), (req: Request, res: Response, _: NextFunction) => {
        res.send("Test 111");
    });
};
