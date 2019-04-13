import assert from "assert";
import { describe, it } from "mocha";
import * as stringutils from "../src/utils/strings";

describe('String Utils Tests', () => {
    it('Resolves Strings With Placeholders', () => {
        let data = ["%s %s", "One", "Two"]
        let result = stringutils.resolve(data);
        assert.equal("One Two", result);
    });

    it('Returns the same string when there are no place holders', () => {
        assert.equal("One", stringutils.resolve(["One"]));
    });
});