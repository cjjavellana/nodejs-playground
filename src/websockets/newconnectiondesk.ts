import { Application } from "express";
import log4js, { Logger } from "log4js";
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

    private static logger: Logger = log4js.getLogger("websocket");
    private app: Application;
    private jwt: Jwt;
    private redis: RedisClient;

    constructor(app: Application) {
        this.app = app;
        this.redis = app.locals.redis;
    }

    public createRoomForUser(socket: Socket) {
        const username = (socket as any).decoded_token.username;
        NewConnectionDesk.logger.info("Creating room for %s", username);
        socket.join(username);
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
Use of this server is monitored for security purposes.\n`
        );
    }

    protected askClientToConnectToSecGroupNamespace(socket: Socket, namespace: string) {
        const username = (socket as any).decoded_token.username;
        const oneTimeToken = this.oneTimeToken();
        this.storeOneTimeTokenToCache(socket.id, this.oneTimeToken());

        NewConnectionDesk.logger.info("Asking user %s to join namespace %s", username, namespace);

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
