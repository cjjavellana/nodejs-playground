import { Application, NextFunction, Request, Response } from "express";
import { authClient } from "../../services/auth";
import { LoginRequest } from "../../forms";

export const register = (app: Application) => {

    /**
     * Accepts a username & password delegates call to an auth service
     */
    app.post("/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        const username = req.body.username;
        const pwd = req.body.password;

        let loginForm = obtainLoginForm(req);

        authClient.authenticate(loginForm.getRequestId(), 
            loginForm.username, loginForm.password, (error, resp, body) => {
            console.log('')
        })
    });

    const obtainLoginForm = (req: Request) => {
        return new LoginRequest(req, req.body.username, req.body.password);
    }
};



