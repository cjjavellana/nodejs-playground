import { Application } from "express";
import { RedisClient } from "redis";
import { Socket } from "socket.io";
import uuid = require("uuid");
import { Jwt } from "../crypto";
import { Authority, Group, Permission, User } from "../data";

/**
 * This class instructs authenticated clients to connect to namespaces
 * they have access to based on their groups
 */
export class NewConnectionDesk {

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
