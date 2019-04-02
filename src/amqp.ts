import amqp, { Connection } from "amqplib";
import { Application } from "express";

export const register = (app: Application) => {
    amqp.connect({
        hostname: process.env.RABBITMQ_HOSTNAME,
        password: process.env.RABBITMQ_PASSWORD,
        port: Number(process.env.RABBITMQ_PORT),
        username: process.env.RABBITMQ_USERNAME
    }).then((conn: Connection) => {
        const channel = conn.createChannel();

        // declare exchanges

        // declare queues

        // bind queues to exchanges

        // register queue callback handlers
    });

};
