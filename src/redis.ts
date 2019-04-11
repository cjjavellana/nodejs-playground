import { Application } from "express";
import redis from "redis";

export const register = (app: Application) => {
    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    });

    redisClient.on("connect", () => {
        console.log("Redis Connected");
    });

    app.locals.redis = redisClient;
};
