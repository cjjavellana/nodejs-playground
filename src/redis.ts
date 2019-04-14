import { Application } from "express";
import log4js from "log4js";
import redis from "redis";

export const register = (app: Application) => {
    const logger = log4js.getLogger("redis");

    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    });

    redisClient.on("connect", () => {
        logger.info("Redis Client Connected");
    });

    app.locals.redis = redisClient;
};
