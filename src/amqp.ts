import amqp, { Channel, Connection, ConsumeMessage, Options, Replies } from "amqplib";
import { EventEmitter } from "events";
import { Application } from "express";
import os from "os";

export const register = (app: Application) => {

    RabbitMQClient.build().then((mqClient: RabbitMQClient) => {
        const messagingHandler = new AMQPMessageHandler(mqClient, app);
        messagingHandler.registerPriceResponseHandler();
    });

};

export class AMQPMessageHandler {

    private mqClient: RabbitMQClient;
    private app: Application;
    private mqChannel: Channel;

    constructor(mqClient: RabbitMQClient, app: Application) {
        this.mqClient = mqClient;
        this.app = app;
        this.mqChannel = mqClient.getChannel();
    }

    public registerPriceResponseHandler() {
        const priceResponseQueueName = os.hostname() + ".pricing.response.queue";
        this.mqClient.createExchange("pricing.exchange", "direct");
        this.mqClient.createQueue(priceResponseQueueName, { durable: true, exclusive: true })
            .then((q: Replies.AssertQueue) => {
                this.mqChannel.bindQueue(q.queue, "pricing.exchange", "pricing.response.queue");
                this.mqChannel.consume(q.queue, this.priceResponseMessageConsumer);
            });
    }

    private priceResponseMessageConsumer(msg: ConsumeMessage) {
        console.log(msg.content.toString());
    }
}

export class RabbitMQClient {

    public static async build(): Promise<RabbitMQClient> {
        if (this.myInstance === undefined) {
            const conn = await this.connect();
            const ch = await this.initializeChannel(conn);
            this.myInstance = new RabbitMQClient(conn, ch);
            return this.myInstance;
        }

        return this.myInstance;
    }

    private static myInstance: RabbitMQClient;

    private static async connect(): Promise<Connection> {
        return await amqp.connect({
            hostname: process.env.RABBITMQ_HOSTNAME,
            password: process.env.RABBITMQ_PASSWORD,
            port: Number(process.env.RABBITMQ_PORT),
            username: process.env.RABBITMQ_USERNAME
        });
    }

    private static async initializeChannel(conn: Connection) {
        return await conn.createChannel();
    }

    private conn: Connection;
    private ch: Channel;

    private constructor(conn: Connection, ch: Channel) {
        this.conn = conn;
        this.ch = ch;
    }

    public async createExchange(name: string, type: string): Promise<Replies.AssertExchange> {
        return this.ch.assertExchange(name, type, { durable: true });
    }

    public async createQueue(name: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue> {
        return this.ch.assertQueue(name, options);
    }

    public getChannel(): Channel {
        return this.ch;
    }
}
