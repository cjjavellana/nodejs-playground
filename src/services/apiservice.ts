
export class BaseApiService {


    headers(requestId: string, username: string = "", others: object = {}){
        let defaultHeaders = {
            'X-User-Id': username,
            'X-Request-Id': requestId
        }

        return {...defaultHeaders, ...others}
    }
}