import { EventEmitter } from "events";
import { Application } from "express";
import log4js, { Logger } from "log4js";
import { Socket } from "socket.io";
import { MasterDataUploadResults, StockPriceResponse } from "../data";
import { Namespace } from "./namespace";

export const register = (app: Application, nsp: Namespace) => {
    const logger: Logger = log4js.getLogger("pricing");
    const eventEmitter: EventEmitter = app.locals.eventEmitter;

    // move to an abstract event handler?
    nsp.on("stockPriceRequest", (socket: Socket, stockPriceRequest: any) => {
        eventEmitter.on("stockPriceRequest", stockPriceRequest);
    }).on("afterInitDemo", (socket: Socket, msg: string) => {
        logger.info("Logged from afterInitDemo", msg);
    });

    // ~ Outgoing messages here ==================================
    eventEmitter.on("uploadComplete", (uploadResults: MasterDataUploadResults) => {
        nsp.to(uploadResults.username).emit("uploadComplete", uploadResults);
    }).on("stockPriceResponse", (response: StockPriceResponse) => {
        nsp.to(response.username).emit("stockPriceResponse", response);
    });
};
