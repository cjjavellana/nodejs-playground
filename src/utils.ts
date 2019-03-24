import express from "express";
import request from "request";

export const isJSONString = (value: string) => {
    try {
        JSON.parse(value);
    } catch (e) {
        return false;
    }

    return true;
};

/**
 * A generic function of writing response to client.
 *
 * DSS - Downstream Service
 *
 * @param error An error object as a result of an API call to downstream service
 * @param dssResponseBody Response body as a result of an API Call to downstream service
 * @param dssResponse Response object as a result of an API Call to downstream service
 * @param clientResponse An express.Response object for writing responses to client
 */
export const handleResponse = (error: any, dssResponseBody: any,
                               dssResponse: request.Response, clientResponse: express.Response) => {
    if (error) {
        console.log(error);
        clientResponse.status(500).send("An error has occurred");
    } else {
        console.log("Downstream API Returned %s", dssResponseBody);

        if (isJSONString(dssResponseBody)) {
            clientResponse.status(dssResponse.statusCode).send(dssResponseBody);
        } else {
            clientResponse.status(dssResponse.statusCode).send({
                message: dssResponseBody
            });
        }
    }
};
