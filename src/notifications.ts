import { Application } from "express";
import redis from "redis";

/**
 * Registers services used for notifications to the application
 * @param app
 */
export const register = (app: Application) => {

    const eventEmitter = app.locals.eventEmitter;

    const subscriber = redis.createClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    });

    subscriber.on("subscribe", (channel: string, count: number) => {
        console.log("Subscribed to %s", channel);
    });

    subscriber.on("message", (channel: string, message: string) => {
        console.log("message received from %s => %s", channel, message);
        eventEmitter.emit("OnUploadCompleteEvent", message);
    });

    subscriber.subscribe("OnUploadCompleteEvent");
};
