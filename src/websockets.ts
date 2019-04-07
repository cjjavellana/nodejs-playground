import events, { EventEmitter } from "events";
import { Application } from "express";
import { RedisClient } from "redis";
import io, { Packet, Socket } from "socket.io";
import uuid = require("uuid");
import { Jwt } from "./crypto";
import {
    Authority, AuthToken, Group, IncomingWebSocketMessage,
    Metrics, OutGoingWebSocketMessage, Permission, User
} from "./data";

/**
 * The main module handling websocket communication.
 *
 * Dependencies
 * ================
 * 1. Must be initialized after redis
 *
 * @param app
 */
export const register = (app: Application) => {
    const eventEmitter: EventEmitter = app.locals.eventEmitter;
    const ws: io.Server = app.locals.io;
    const socketAuthenticator = new SocketTokenAuthenticator(app);

    // ~ default namespace
    const defaultNs = new NameSpace(app, ws);
    defaultNs.on("authenticate", (socket: Socket, token: AuthToken) => {
        socketAuthenticator.onAuthenticate(socket, token);
    });
    defaultNs.build();

    /**
     * Subscribe to 'OnUploadCompleteEvent' event to broadcast the message through
     * websockets
     */
    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        defaultNs.emit("OnUploadCompleteEvent", message);
    });

    // ~ admin namespace
    const adminNs = new NameSpace(app, ws, "/admin");
    adminNs.onConnect((socket: Socket) => {
        console.log("someone connected");
        socket.send("/admin someone connected");
    });
    adminNs.build();

    eventEmitter.on("systemUtilization", (metrics: Metrics) => {
        adminNs.emit("systemUtilization", metrics);
    });
};

class WsFunctionEventType {
    public eventName: string;
    public listener: (socket: Socket, args: any) => void;

    constructor(eventName: string, listener: (socket: Socket, args: any) => void) {
        this.eventName = eventName;
        this.listener = listener;
    }
}

class NameSpace {

    private nsp: io.Server | io.Namespace;
    private app: Application;
    private listeners = new Map<string, (socket: Socket, args: any) => any>();
    private onConnectHandlers: Array<(socket: Socket) => void> = new Array();

    constructor(app: Application, ws: io.Server, namespace?: string) {
        this.app = app;
        this.nsp = (namespace) ? ws.of(namespace) : ws;
    }

    public on(eventName: string, listener: (socket: Socket, args: any) => any) {
        this.listeners.set(eventName, listener);
    }

    public onConnect(func: (socket: Socket) => void) {
        this.onConnectHandlers.push(func);
    }

    public send(message: OutGoingWebSocketMessage) {
        console.log("[WsOUT Message] %s", message.correlationId);
        this.nsp.send(message.args());
    }

    public emit(event: string, args: any) {
        this.nsp.emit(event, args);
    }

    public build() {
        this.nsp.on("connection", (socket: Socket) => this.registerHandlers(socket));
    }

    protected registerHandlers(socket: Socket) {
        this.registerPerRequestAdvice(socket);
        this.registerEventHandlers(socket);
        this.registerRunOnConnectHandlers(socket);
    }

    protected registerPerRequestAdvice(socket: Socket) {
        socket.use((packet: Packet, next) => {
            this.logMessage(packet);
            next();
        });
    }

    // TODO: Include Username in the log
    protected logMessage(packet: Packet) {
        const payload = this.payload(packet);
        if (this.isIncomingWebSocketMessage(payload)) {
            // [WsIN] foobar authenticate xxxx-xxxx-xxxx-xxxx
            const message = payload as IncomingWebSocketMessage;
            console.log("[WsIN] %s %s %s", "foobar", message.event, message.correlationId);
        } else {
            // be careful with this, if sensitive messages does not deserialize to
            // IncomingWebSocketMessage it could end up being logged
            const user = "foobar";
            const messageAsTuple = payload as [string, any];
            const event = messageAsTuple[0];
            const messageBody = messageAsTuple[1];
            try {
                // is it a json payload?
                const jsonPayload = JSON.stringify(messageBody);
                console.log("[WARN][WsIN] %s %s %s", user, event, jsonPayload);
            } catch (error) {
                console.log("[WARN][WsIN] %s %s %s", user, event, payload);
            }
        }
    }

    protected payload(packet: Packet): IncomingWebSocketMessage | [string, any] {
        const event = packet[0];
        const payload = packet[1];

        try {
            const message = payload as IncomingWebSocketMessage;
            message.event = event;
            return message;
        } catch (error) {
            console.log("Failed to deserialize \"%s\" to IncomingWebSocketMessage", payload);
            return [event, payload];
        }
    }

    protected isIncomingWebSocketMessage(obj: any): boolean {
        return typeof obj.correlationId === "string";
    }

    protected registerEventHandlers(socket: Socket) {
        for (const [key, value] of this.listeners) {
            socket.on(key, (args: any) => {
                value(socket, args);
            });
        }
    }

    protected registerRunOnConnectHandlers(socket: Socket) {
        for (const handler of this.onConnectHandlers) {
            handler(socket);
        }
    }
}

class SocketTokenAuthenticator {

    private app: Application;
    private jwt: Jwt;
    private redis: RedisClient;

    constructor(app: Application) {
        this.app = app;
        this.redis = app.locals.redis;
        this.jwt = app.locals.jwt;
    }

    public onAuthenticate(socket: Socket, token: AuthToken) {
        console.log("Socket auth event: %s", token.correlationId);

        if (this.validate(token)) {
            console.log("Setting %s %s", socket.id, token.correlationId);
            const userGroups = this.obtainUser().groups;
            userGroups.forEach((g) => this.askClientToConnectToSecGroupNamespace(socket, g.name));
            this.sendDisclaimer(socket);
        } else {
            socket.send("I'm sorry, I do not know you");
            socket.disconnect(true);
        }
    }

    protected validate(token: AuthToken): boolean {
        return token.token === "bbb";
    }

    protected obtainUser(): User {
        return new User("cjavellana", [new Group("/admin")], [new Permission("equity", "getPrice", Authority.READ)]);
    }

    protected sendDisclaimer(socket: Socket) {
        socket.send(`Welcome to the simple nodejs server.
Use of this server is monitored for security purposes.`
        );
    }

    protected askClientToConnectToSecGroupNamespace(socket: Socket, namespace: string) {
        const oneTimeToken = this.oneTimeToken();
        this.storeOneTimeTokenToCache(socket.id, this.oneTimeToken());
        socket.emit("connectToNsp", {
            namespace,
            token: oneTimeToken
        });
    }

    protected storeOneTimeTokenToCache(socketId: string, oneTimeToken: string) {
        this.redis.setex(oneTimeToken, 10, socketId);
    }

    protected oneTimeToken(): string {
        return uuid.v4();
    }
}
