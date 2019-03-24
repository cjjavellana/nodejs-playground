import { Request } from "express";
import uuidv4 from "uuid/v4";

export class AbstractRequestForm {
    private req: Request;

    constructor(req: Request) {
        this.req = req;
    }

    getRequestId(): string {
        let requestId = this.req.header('X-Request-Id')
        if(requestId) return requestId;
        else return uuidv4();
    }
}

export class LoginRequest extends AbstractRequestForm {
    username: string;
    password: string;

    constructor(req: Request, username: string, password: string) {
        super(req);
        this.username = username;
        this.password = password;
    }
}