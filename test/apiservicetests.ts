import assert from "assert";
import { describe, it } from "mocha";
import { BaseApiService } from "../src/services/apiservice";

describe('Base API Service Tests', () => {
    it('Merges custom headers with default headers', () => {
        let apiService = new BaseApiService()
        let headers = apiService.headers("aaa", "batman", {
            "x-custom-header-1": "custom-header1",
            "x-custom-header-2": "custom-header2"
        }) as any;
        assert("aaa", headers["X-Request-Id"]);
        assert("batman", headers["X-User-Id"]);
        assert("custom-header1", headers["x-custom-header-1"]);
    })
});