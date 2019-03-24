import { Application } from "express";
import requests, { RequestCallback } from "request";
import { BaseApiService } from "./apiservice";

type AuthCallback= (result: any) => any;

export class AuthService extends BaseApiService {

    private baseUrl: string;

    constructor() {
        super();
        this.baseUrl = process.env.AUTH_SERVICE_URL;
    }

    public authenticate(requestId: string, username: string, password: string, callback: RequestCallback) {
        // let caller handle api response
        requests.post(this.baseUrl + "/api/v1/login", {
            body: {
                password,
                username
            },
            headers: this.headers(requestId, username),
            json: true
        }, callback);
    }

}
