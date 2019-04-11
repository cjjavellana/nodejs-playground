import amqp, { AmqpConnectionManager, ChannelWrapper, SetupFunc } from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage, Options } from "amqplib";
import { EventEmitter } from "events";
import { Application } from "express";
import os from "os";
import { MasterDataUploadResults } from "./data";

export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const msgHandlers = new AmqpMessageHandlers(app);
    const masterDataEventHandler = new MasterDataEventHandler(app);

    RabbitMQClient.connect()
        .then((conn: amqp.AmqpConnectionManager) => {
            const channelName = os.hostname() + "-channel";
            return conn.createChannel({
                json: true,
                name: channelName,
                setup: setupFunc
            });
        });

    /**
     * Called everytime amqplib reconnects to the broker.
     * @param channel
     */
    const setupFunc: amqp.SetupFunc = (channel: ConfirmChannel) => {
        channel.assertExchange("pricing.exchange", "direct", { durable: true });
        channel.assertExchange("masterdata.exchange", "direct", { durable: true });

        const pxRespQueue = os.hostname() + ".pricing.response.queue";
        channel.assertQueue(pxRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(pxRespQueue, "pricing.exchange", "pricing.response");
        channel.consume(pxRespQueue, (msg: ConsumeMessage) => {
            msgHandlers.pxResponseHandler(msg);
            channel.ack(msg);
        });

        const masterDataRespQueue = os.hostname() + ".masterdata.upload.queue";
        channel.assertQueue(masterDataRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(masterDataRespQueue, "masterdata.exchange", "masterdata.upload.complete");
        channel.consume(masterDataRespQueue, (msg: ConsumeMessage) => {
            masterDataEventHandler.onUploadComplete(msg);
            channel.ack(msg);
        });

        eventEmitter.on("priceRequest", (args: any[]) => {
            console.log(args);
        });
    };

};

export class MasterDataEventHandler {

    private app: Application;
    private eventEmitter: EventEmitter;

    constructor(app: Application) {
        this.app = app;
        this.eventEmitter = app.locals.eventEmitter;
    }

    public onUploadComplete(msg: ConsumeMessage) {
        this.eventEmitter.emit("uploadComplete", JSON.parse(msg.content.toString()) as MasterDataUploadResults);
    }
}

export class AmqpMessageHandlers {

    private app: Application;
    private eventEmitter: EventEmitter;

    constructor(app: Application) {
        this.app = app;
        this.eventEmitter = app.locals.eventEmitter;
    }

    public pxResponseHandler(msg: ConsumeMessage) {
        console.log(msg.content.toString());
    }

    // add more message handlers here
    // need to broadcast message through socketio?
    // emit event instead - using app.locals.eventEmitter
}

export class RabbitMQClient {

    public static async connect(): Promise<amqp.AmqpConnectionManager> {
        const conn = await this.internalConnect();
        return conn;
    }

    private static internalConnect(): amqp.AmqpConnectionManager {
        return amqp.connect([process.env.RABBITMQ_URL]);
    }
}
