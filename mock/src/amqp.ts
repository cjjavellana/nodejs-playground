import amqp, { AmqpConnectionManager, ChannelWrapper, SetupFunc } from "amqp-connection-manager";
import { Channel, ConfirmChannel, ConsumeMessage, Options } from "amqplib";
import { EventEmitter } from "events";
import { Application } from "express";
import os from "os";

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

        const pxRespQueue = os.hostname() + ".pricing.request.queue";
        channel.assertQueue(pxRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(pxRespQueue, "pricing.exchange", "pricing.request");

    };

    const setMasterDataHandlers = (channel: Channel) => {
        channel.assertExchange("masterdata.exchange", "direct", { durable: true });

        eventEmitter.on("uploadComplete", () => {
            channel.publish("masterdata.exchange", "masterdata.upload.complete",
                new Buffer(JSON.stringify({
                    added: 10,
                    errors: ["Hello", "World", "123"],
                    ignored: 30,
                    modified: 20
                })));
        });
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
