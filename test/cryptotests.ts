import assert from "assert";
import { describe, it } from "mocha";
import { Jwt } from "../src/crypto";
import * as dotenv from "../src/loadenv";

describe('Jwt Crypto Tests', () => {
    dotenv.config()

    it('It can load public & private keys', () => {
        Jwt.build().then((j: Jwt) => {
            assert(j.getPrivateKey() != undefined)
            assert(j.getPublicKey() != undefined)
        });
    })

    it("It can generate secure tokens", () => {
        Jwt.build().then((j: Jwt) => {
            let token = j.generateToken('cjavellana')
            console.log("Token %s", token)
            assert(token != undefined)
        });
    })

    it("It can decrypt a secure token", () => {
        Jwt.build().then((j: Jwt) => {
            let token = j.generateToken('cjavellana')
            let verifiedToken = j.verify(token)
            console.log(verifiedToken)
            assert(verifiedToken != undefined)
        });
    });
});