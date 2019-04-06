import events, { EventEmitter } from "events";
import { Application } from "express";
import { RedisClient } from "redis";
import io, { Socket } from "socket.io";
import uuid = require("uuid");
import { Jwt } from "./crypto";
import { Authority, AuthToken, Group, Permission, User, Metrics } from "./data";

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

    ws.on("connection", (socket: Socket) => {
        socket.on("authenticate", (token: AuthToken) => {
            socketAuthenticator.onAuthenticate(socket, token);
        });
    });

    /**
     * Subscribe to 'OnUploadCompleteEvent' event to broadcast the message through
     * websockets
     */
    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        ws.emit("OnUploadCompleteEvent", message);
    });

    // ~ admin namespace
    const adminNsp = ws.of("/admin");
    adminNsp.on("connection", (socket: Socket) => {
        console.log("someone connected");
        socket.send("/admin someone connected");
    });

    eventEmitter.on("systemUtilization", (metrics: Metrics) => {
        adminNsp.emit("systemUtilization", metrics);
    });
};

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
        console.log("Socket auth event: %s", token.requestId);

        if (this.validate(token)) {
            console.log("Setting %s %s", socket.id, token.requestId);
            let userGroups = this.obtainUser().groups
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
            namespace: namespace,
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
