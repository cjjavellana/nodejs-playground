import { Application, NextFunction, Request, Response } from "express";
import { LoginRequest } from "../../forms";
import { AuthService } from "../../services/auth";
import { handleResponse, isJSONString } from "../../utils";
import request = require("request");

export const register = (app: Application) => {

    const authClient = new AuthService();

    /**
     * Accepts a username & password delegates call to an auth service
     */
    app.post("/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        const username = req.body.username;
        const pwd = req.body.password;

        const loginForm = obtainLoginForm(req);

        authClient.authenticate(loginForm.getRequestId(),
            loginForm.username, loginForm.password, (error, resp, body) => {
            if (error) {
                console.log(error);
                res.status(500).send("An error has occurred");
            } else {
                console.log("Downstream API %s Returned %s", resp.request.href, body.toString());

                if(isAuthSuccess(resp)){
                    // cache permissions, generate token
                }
                
                // return response to client
                if (isJSONString(body)) {
                    res.status(resp.statusCode).send(resp);
                } else {
                    res.status(resp.statusCode).send({
                        message: body
                    });
                }
            }
        });
    });

    const obtainLoginForm = (req: Request) => {
        return new LoginRequest(req, req.body.username, req.body.password);
    };

    const isAuthSuccess = (resp: request.Response) => resp.statusCode == 200
};
