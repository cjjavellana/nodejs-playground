import { Application } from "express";
import request, { RequestCallback } from "request";
import { BaseApiService } from "./apiservice";

type AuthCallback= (result: any) => any;

class AuthService extends BaseApiService {

    private baseUrl: string;
    
    constructor() {
        super();
        this.baseUrl = process.env.AUTH_SERVICE_URL;
    }

    public authenticate(requestId: string, username: string, password: string, callback: RequestCallback) {
        // let caller handle api response
        request.post(this.baseUrl + "/api/v1/login", {
            body: {
                password: "{password}",
                username: "{username}"
            },
            headers: this.headers(requestId, username)
        }, callback);
    }

}

export const authClient = new AuthService()