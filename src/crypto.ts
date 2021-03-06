import { EventEmitter } from "events";
import { Application } from "express-serve-static-core";
import jwt from "jsonwebtoken";

export class Jwt {

    public static async build(): Promise<Jwt> {
        if (!this.myInstance) {
            const priv = process.env.JWT_PRIVATE_KEY;
            const pub = process.env.JWT_PUBLIC_KEY;
            this.myInstance =  new Jwt(priv, pub);
        }

        return this.myInstance;
    }
    private static myInstance: Jwt;

    private privateKey: string;
    private publicKey: string;

    private constructor(priv: string, pub: string) {
        this.privateKey = priv;
        this.publicKey = pub;
    }

    public getPrivateKey(): string {
        return this.privateKey;
    }

    public getPublicKey(): string {
        return this.publicKey;
    }

    public generateToken(username: string): string {
        const signOptions = this.signOptions(username);
        const payload = this.payload(username);
        return jwt.sign(payload, this.getPrivateKey(), signOptions);
    }

    // ~

    public verify(token: string): any {
        return jwt.verify(token, this.getPublicKey(), this.verifyOptions());
    }

    private payload(username: string): any {
        return {
            username
        };
    }

    private signOptions(username: string): jwt.SignOptions {
        return {
            algorithm:  "RS256",
            audience:  "https://cjavellana.me",
            expiresIn:  "12h",
            issuer:  "Cjavellana",
            subject:  username
           };
    }

    private verifyOptions(): jwt.VerifyOptions {
        return {
            algorithms:  ["RS256"],
            audience:  "https://cjavellana.me",
            clockTolerance: 60,
            issuer:  "Cjavellana"
        };
    }
}

export const register = (app: Application) => {
    Jwt.build().then((j: Jwt) => {
        app.locals.jwt = j;

        process.nextTick(() => {
            const emitter: EventEmitter = app.locals.eventEmitter;
            emitter.emit("jwtReady", j);
        });
    });
};
