import { Application, NextFunction, Request, Response } from "express";

interface LoginRequest {
    username: string;
    password: string;
}

/**
 *
 * @param app
 */
export const register = (app: Application) => {

    app.post("/auth/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        const loginReq = req.body as LoginRequest;
        console.log("Username: %s; Password: %s", loginReq.username, loginReq.password);
        res.send("");
    });

};
