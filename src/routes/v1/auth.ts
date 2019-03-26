import { Application, NextFunction, Request, Response } from "express";
import { RedisClient } from "redis";
import request = require("request");
import { Jwt } from "../../crypto";
import { LoginRequest } from "../../forms";
import { AuthService } from "../../services/auth";
import { handleResponse, isJSONString } from "../../utils";

export const register = (app: Application) => {

    const authClient = new AuthService();

    /**
     * Accepts a username & password delegates call to an auth service
     */
    app.post("/api/v1/login", (req: Request, res: Response, next: NextFunction) => {
        const username = req.body.username;
        const pwd = req.body.password;

        const loginForm = obtainLoginForm(req);

        authClient.authenticate(loginForm.getRequestId(),
            loginForm.username, loginForm.password, (error, resp, body) => {
            if (error) {
                console.log(error);
                res.status(500).send("An error has occurred");
            } else {
                const bodyAsJson = JSON.stringify(body);
                console.log("Downstream API %s Returned %s", resp.request.href, bodyAsJson);

                if (isAuthSuccess(resp)) {
                    // cache permissions, generate token
                    cacheUserPermissionFor(loginForm.username, bodyAsJson);
                    setTokenToHeader(res, tokenFor(loginForm.username));
                }

                sendResponse(res, resp, body);
            }
        });
    });

    const setTokenToHeader = (res: Response, token: string) => res.setHeader("X-Auth-Token", token);

    const tokenFor = (username: string) => {
        const jwt: Jwt = app.locals.jwt;
        return jwt.generateToken(username);
    };

    const cacheUserPermissionFor = (username: string, permission: any) => {
        const redis: RedisClient = app.locals.redis;
        redis.set(username, permission);
    };

    const sendResponse = (clientResp: Response,
                          downstreamResp: request.Response, responseBody: any) => {

        if (isJSONString(responseBody)) {
            clientResp.status(downstreamResp.statusCode).send(responseBody);
        } else {
            clientResp.status(downstreamResp.statusCode).send({
                message: responseBody
            });
        }
    };

    const obtainLoginForm = (req: Request) => {
        return new LoginRequest(req, req.body.username, req.body.password);
    };

    const isAuthSuccess = (resp: request.Response) => resp.statusCode === 200;
};
