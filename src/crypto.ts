import fs from "fs";
import path from "path";
import { promisify } from "util";
import jwt from "jsonwebtoken";

export class Jwt {

    private privateKey: string;
    private publicKey: string;
    
    private constructor(priv: string, pub: string){
        this.privateKey = priv;
        this.publicKey = pub;
    }

    getPrivateKey(): string {
        return this.privateKey
    }

    getPublicKey(): string {
        return this.publicKey
    }

    generateToken(username: string): string {
        let signOptions = this.signOptions(username)
        let payload = this.payload(username)
        return jwt.sign(payload, this.getPrivateKey(), signOptions)
    }

    // ~ 

    verify(token: string): any {
        return jwt.verify(token, this.publicKey, this.verifyOptions())
    }

    private payload(username: string): any {
        return {
            username: username
        }
    }

    private signOptions(username: string): jwt.SignOptions {
        return {
            issuer:  "Cjavellana",
            subject:  username,
            audience:  "https://cjavellana.me",
            expiresIn:  "12h",
            algorithm:  "RS256"
           };
    }

    private verifyOptions() : jwt.VerifyOptions {
        return {
            issuer:  "Cjavellana",
            audience:  "https://cjavellana.me",
            clockTolerance: 60,
            algorithms:  ["RS256"]
        }
    }

    private static loadFileToBuffer(keyPath: string): Promise<string> {
        let readFileAsync = promisify(fs.readFile)
        return readFileAsync(keyPath)
                .then((v: Buffer) => { 
                    return v.toString();
                });
    }

    static async build(): Promise<Jwt> {
        let priv = await this.loadFileToBuffer(path.join(__dirname, "..", "jwtRS256.key"))
        let pub = await this.loadFileToBuffer(path.join(__dirname, "..", "jwtRS256.key.pub"))
        return new Jwt(priv, pub);
    }
}
