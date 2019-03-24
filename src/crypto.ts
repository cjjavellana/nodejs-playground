import fs from "fs";
import path from "path";
import { promisify } from "util";

type SetFileContent = (fileContent: string) => any;

export class Jwt {

    private privateKey: string;
    private publicKey: string;
    
    private constructor(priv: string, pub: string){
        this.privateKey = priv;
        this.publicKey = pub;
    }

    getPrivateKey(): string {
        return this.privateKey;
    }

    getPublicKey(): string {
        return this.publicKey;
    }

    // ~ 

    private static loadFileToBuffer(keyPath: string): Promise<string> {
        let readFileAsync = promisify(fs.readFile)
        return readFileAsync(keyPath)
                .then((v: Buffer) => { 
                    return v.toString();
                });
    }

    static async build(): Promise<Jwt> {
        let priv = await this.loadFileToBuffer(path.join(__dirname, "..", "keys"))
        let pub = await this.loadFileToBuffer(path.join(__dirname, "..", "keys.pub"))
        return new Jwt(priv, pub);
    }
}
