import { Application } from "express";
import redis, { RedisClient } from "redis";

/**
 * Registers services used for notifications to the application
 * @param app
 */
export const register = (app: Application) => {

    const eventEmitter = app.locals.eventEmitter;

    const redisSubcriber: RedisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    });

    redisSubcriber.on("subscribe", (channel: string, count: number) => {
        console.log("Subscribed to %s", channel);
    });

    redisSubcriber.on("message", (channel: string, message: string) => {
        if (channel === "OnUploadCompleteEvent") {
            eventEmitter.emit("OnUploadCompleteEvent", message);
        }
    });

    redisSubcriber.subscribe("OnUploadCompleteEvent");
};
