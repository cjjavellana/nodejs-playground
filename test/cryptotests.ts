import assert from "assert";
import { describe, it } from "mocha";
import { Jwt } from "../src/crypto";

describe('Jwt Crypto Tests', () => {
    it('It can load public & private keys', () => {
        Jwt.build().then((j: Jwt) => {
            assert(j.getPrivateKey() != undefined)
            assert(j.getPublicKey() != undefined)
        });
    })
});