import { EventEmitter } from "events";
import { Application } from "express";
import { RedisClient } from "redis";
import io, { Packet, Socket } from "socket.io";
import socketioJwt from "socketio-jwt";
import uuid = require("uuid");
import { Jwt } from "./crypto";
import {
    Authority, Group, Metrics, OutGoingWebSocketMessage, Permission, User
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

    eventEmitter.on("jwtReady", (jwt: Jwt) => {
        initDefaultNamespace(jwt);
        initAdminNamespace(jwt);
    });

    const initDefaultNamespace = (jwt: Jwt) => {
        const newConnectionDesk = new NewConnectionDesk(app);
        const defaultNs = new NameSpace(app, ws);

        // validate client connecting to the default namespace
        defaultNs.onConnect(socketioJwt.authorize({
            decodedPropertyName: "decoded_token",
            secret: jwt.getPublicKey()
        })).onClientAuthenticated((socket: Socket) => {
            newConnectionDesk.instructClientToConnectToSecGroupNamespace(socket);
        }).on("stockPriceRequest", (socket: Socket, stockPriceRequest: any) => {
            eventEmitter.on("stockPriceRequest", stockPriceRequest);
        }).build();

        eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
            defaultNs.emit("OnUploadCompleteEvent", message);
        });
    };

    const initAdminNamespace = (jwt: Jwt) => {
        const adminNs = new NameSpace(app, ws, "/admin");
        adminNs.onConnect((socket: Socket) => {
            socket.send("Welcome to the /admin namespace");
        }).build();

        eventEmitter.on("systemUtilization", (metrics: Metrics) => {
            adminNs.emit("systemUtilization", metrics);
        });
    };
};

class NameSpace {

    private nsp: io.Server | io.Namespace;
    private app: Application;
    private listeners = new Map<string, (socket: Socket, args: any) => any>();
    private onConnectHandlers: Array<(socket: Socket) => void> = new Array();
    private onClientAuthenticatedHandler: Array<(socket: Socket) => void> = new Array();

    constructor(app: Application, ws: io.Server, namespace?: string) {
        this.app = app;
        this.nsp = (namespace) ? ws.of(namespace) : ws;
    }

    public on(eventName: string, listener: (socket: Socket, args?: any) => any): NameSpace {
        this.listeners.set(eventName, listener);
        return this;
    }

    public onConnect(func: (socket: Socket) => void): NameSpace {
        this.onConnectHandlers.push(func);
        return this;
    }

    public send(message: OutGoingWebSocketMessage) {
        console.log("[WsOUT Message] %s", message.correlationId);
        this.nsp.send(message.args());
    }

    public emit(event: string, args: any) {
        this.nsp.emit(event, args);
    }

    public onClientAuthenticated(func: (socket: Socket) => void): NameSpace {
        this.onClientAuthenticatedHandler.push(func);
        return this;
    }

    public build() {
        this.nsp
            .on("connection", (socket: Socket) => {
                this.registerRunOnConnectHandlers(socket);
            })
            .on("authenticated", (socket: Socket) => {
                this.registerHandlers(socket);
                this.fireOnAuthenticatedHandlers(socket);
            });
    }

    protected fireOnAuthenticatedHandlers(socket: Socket) {
        for (const func of this.onClientAuthenticatedHandler) {
            func(socket);
        }
    }

    protected registerHandlers(socket: Socket) {
        this.registerPerRequestAdvice(socket);
        this.registerEventHandlers(socket);
    }

    protected registerPerRequestAdvice(socket: Socket) {
        socket.use((packet: Packet, next) => {
            this.logMessage(packet);
            next();
        });
    }

    // TODO: Include Username in the log
    protected logMessage(packet: Packet) {
        const event = packet[0];
        const payload = packet[1];

        if (this.isWebSocketMessage(payload)) {
            // [WsIN] foobar authenticate xxxx-xxxx-xxxx-xxxx
            console.log("[WsIN] %s %s %s", "foobar", event, payload.correlationId);
        } else {
            // be careful with this, if sensitive messages does not deserialize to
            // WebSocketMessage it could end up being logged
            const user = "foobar";
            try {
                // is it a json payload?
                const jsonPayload = JSON.stringify(payload);
                console.log("[WARN][WsIN] %s %s %s", user, event, jsonPayload);
            } catch (error) {
                console.log("[WARN][WsIN] %s %s %s", user, event, payload);
            }
        }
    }

    protected isWebSocketMessage(obj: any): boolean {
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

/**
 * This class instructs authenticated clients to connect to namespaces
 * they have access to based on their groups
 */
class NewConnectionDesk {

    private app: Application;
    private jwt: Jwt;
    private redis: RedisClient;

    constructor(app: Application) {
        this.app = app;
        this.redis = app.locals.redis;
    }

    public instructClientToConnectToSecGroupNamespace(socket: Socket) {
        const userGroups = this.obtainUser().groups;
        userGroups.forEach((g) => this.askClientToConnectToSecGroupNamespace(socket, g.name));
        this.sendDisclaimer(socket);
    }

    protected obtainUser(): User {
        return new User("cjavellana", [new Group("/admin")],
            [new Permission("equity-healthcare", "stockPriceRequest", Authority.READ)]);
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
