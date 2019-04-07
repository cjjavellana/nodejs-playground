import { EventEmitter } from "events";
import { Application } from "express-serve-static-core";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { promisify } from "util";

export class Jwt {

    public static async build(): Promise<Jwt> {
        if (!this.myInstance) {
            const priv = await this.loadFileToBuffer(path.join(__dirname, "..", "jwtRS256.key"));
            const pub = await this.loadFileToBuffer(path.join(__dirname, "..", "jwtRS256.key.pub"));
            this.myInstance =  new Jwt(priv, pub);
        }

        return this.myInstance;
    }
    private static myInstance: Jwt;

    private static loadFileToBuffer(keyPath: string): Promise<string> {
        const readFileAsync = promisify(fs.readFile);
        return readFileAsync(keyPath)
                .then((v: Buffer) => {
                    return v.toString();
                });
    }
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
        return jwt.verify(token, this.publicKey, this.verifyOptions());
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
