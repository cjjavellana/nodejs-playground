import amqp, { AmqpConnectionManager, ChannelWrapper, SetupFunc } from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage } from "amqplib";
import { EventEmitter } from "events";
import { Application } from "express";
import os from "os";

export const register = (app: Application) => {
    const eventEmitter:EventEmitter = app.locals.eventEmitter;
    const msgHandlers = new AmqpMessageHandlers(app);

    RabbitMQClient.connect(this.setupFunc)
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
        const pxRespQueue = os.hostname() + ".pricing.response.queue";
        channel.assertExchange("pricing.exchange", "direct", { durable: true });
        channel.assertQueue(pxRespQueue, { exclusive: false, durable: false });
        channel.bindQueue(pxRespQueue, "pricing.exchange", "pricing.response");
        channel.consume(pxRespQueue, msgHandlers.pxResponseHandler);

        eventEmitter.on('priceRequest', (args: any[]) => {
            
        })
    };

    
};

export class AmqpMessageHandlers {

    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public pxResponseHandler(msg: ConsumeMessage) {
        console.log(msg.content.toString());
    }

    // add more handlers message handlers here
    // need to broadcast message through socketio? 
    // emit event instead using app.locals.eventEmitter
}

export class RabbitMQClient {

    public static async connect(setupFunc: SetupFunc): Promise<amqp.AmqpConnectionManager> {
        const conn = await this.internalConnect();
        return conn;
    }

    private static internalConnect(): amqp.AmqpConnectionManager {
        return amqp.connect([process.env.RABBITMQ_URL]);
    }
}
