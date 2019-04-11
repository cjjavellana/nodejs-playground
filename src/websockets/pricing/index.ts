import { EventEmitter } from "events";
import { Application } from "express";
import { Socket } from "socket.io";
import { MasterDataUploadResults, StockPriceResponse } from "../../data";
import { Namespace } from "../namespace";

export const register = (app: Application, nsp: Namespace) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;

    // validate client connecting to the default namespace
    nsp.addEventHandler("stockPriceRequest", (socket: Socket, stockPriceRequest: any) => {
        eventEmitter.on("stockPriceRequest", stockPriceRequest);
    });

    /**
     * Demonstrates that event handler can still be registered after Namespace.build()
     */
    nsp.addEventHandler("afterInitDemo", (socket: Socket, msg: string) => {
        console.log("afterInitDemo %s", msg);
    });

    // ~ Outgoing messages here ==================================

    eventEmitter.on("uploadComplete", (uploadResults: MasterDataUploadResults) => {
        nsp.to(uploadResults.username).emit("uploadComplete", uploadResults);
    }).on("stockPriceResponse", (response: StockPriceResponse) => {
        nsp.to(response.username).emit("stockPriceResponse", response);
    });
};
