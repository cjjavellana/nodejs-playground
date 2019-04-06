import { Request } from "express";
import uuidv4 from "uuid/v4";

/**
 * Provides common functions for obtaining common values from the request
 */
export class BaseRequestForm {
    private req: Request;

    constructor(req: Request) {
        this.req = req;
    }

    public getRequestId(): string {
        return this.req.header("X-Request-Id") || uuidv4();
    }
}

export class LoginRequest extends BaseRequestForm {
    public username: string;
    public password: string;

    constructor(req: Request, username: string, password: string) {
        super(req);
        this.username = username;
        this.password = password;
    }
}
