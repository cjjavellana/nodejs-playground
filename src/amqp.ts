import amqp, { AmqpConnectionManager, ChannelWrapper, SetupFunc } from "amqp-connection-manager";
import { Channel, ConfirmChannel, ConsumeMessage, Options } from "amqplib";
import { EventEmitter } from "events";
import { Application } from "express";
import os from "os";
import { MasterDataUploadResults } from "./data";

export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;

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
    const setupFunc = (channel: ConfirmChannel) => {
        setPricingHandlers(channel);
        setMasterDataHandlers(channel);

        eventEmitter.on("priceRequest", (args: any[]) => {
            console.log(args);
        });
    };

    const setPricingHandlers = (channel: Channel) => {
        channel.assertExchange("pricing.exchange", "direct", { durable: true });
        const msgHandlers = new AmqpMessageHandlers(app, channel);

        const pxRespQueue = os.hostname() + ".pricing.response.queue";
        channel.assertQueue(pxRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(pxRespQueue, "pricing.exchange", "pricing.response");
        channel.consume(pxRespQueue, msgHandlers.pxResponseHandler);
    };

    const setMasterDataHandlers = (channel: Channel) => {
        channel.assertExchange("masterdata.exchange", "direct", { durable: true });
        const masterDataEventHandler = new MasterDataEventHandler(app, channel);

        const masterDataRespQueue = os.hostname() + ".masterdata.upload.queue";
        channel.assertQueue(masterDataRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(masterDataRespQueue, "masterdata.exchange", "masterdata.upload.complete");
        channel.consume(masterDataRespQueue, masterDataEventHandler.onUploadComplete);
    };
};

export class BaseAmqpEventHandler {

    protected app: Application;
    protected channel: Channel;

    constructor(app: Application, channel: Channel) {
        this.app = app;
        this.channel = channel;
    }

}

export class MasterDataEventHandler extends BaseAmqpEventHandler {

    private eventEmitter: EventEmitter;

    constructor(app: Application, channel: Channel) {
        super(app, channel);
        this.eventEmitter = app.locals.eventEmitter;
    }

    public onUploadComplete(msg: ConsumeMessage) {
        this.eventEmitter.emit("uploadComplete", JSON.parse(msg.content.toString()) as MasterDataUploadResults);
        this.channel.ack(msg);
    }
}

export class AmqpMessageHandlers extends BaseAmqpEventHandler {

    private eventEmitter: EventEmitter;

    constructor(app: Application, channel: Channel) {
        super(app, channel);
        this.eventEmitter = app.locals.eventEmitter;
    }

    public pxResponseHandler(msg: ConsumeMessage) {
        console.log(msg.content.toString());
        this.channel.ack(msg);
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
