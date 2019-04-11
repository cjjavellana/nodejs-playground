import { Application, NextFunction, Request, Response } from "express";

class LoginRequest {
    public username: string;
    public password: string;
}

enum Authority {
    ALL, READ, MODIFY, DELETE
}

class Permission {
    public module: string;
    public name: string;
    public authority: Authority;

    constructor(module: string, name: string, authority: Authority) {
        this.module = module;
        this.name = name;
        this.authority = authority;
    }
}

class UserAuthority {

    public username: string;
    public permissions: Permission[];

    constructor(username: string, permissions: Permission[]) {
        this.username = username;
        this.permissions = permissions;
    }

}

/**
 *
 * @param app
 */
export const register = (app: Application) => {

    /**
     * Performs a mock authentication.
     *
     * Accounts:
     *
     */
    app.post("/auth/api/v1/login", (req: Request, res: Response, _: NextFunction) => {
        const loginReq = req.body as LoginRequest;
        console.log("Username: %s; Password: %s", loginReq.username, loginReq.password);
        if (loginReq.username === "aaa") {
            res.header("X-Auth-Token", "aaabbbcccdddeeefff");
            res.send(roleSearch());
        } else {
            res.status(401).send({message: "Not Authorized"});
        }
    });

};

const roleSearch = () => {
    return new UserAuthority("aaa", [
        new Permission("equities-healthcare", "search", Authority.READ),
        new Permission("equities-aviation", "search", Authority.ALL),
    ]);
};
