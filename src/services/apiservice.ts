
export class BaseApiService {

    public headers(requestId: string, username: string = "", others: object = {}) {
        const defaultHeaders = {
            "X-Request-Id": requestId,
            "X-User-Id": username
        };

        return {...defaultHeaders, ...others};
    }
}
