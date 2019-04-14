import { Application } from "express";
import log4js from "log4js";
import io, { Packet, Socket } from "socket.io";
import { WebSocketMessage } from "../data";
import { Log } from "../utils/logcontext";

export class Namespace {
    private static logger = log4js.getLogger("websocket");

    private nsp: io.Server | io.Namespace;
    private app: Application;
    private listeners = new Map<string, (socket: Socket, args: any) => any>();
    private onConnectHandlers: Array<(socket: Socket) => void> = new Array();
    private onClientAuthenticatedHandler: Array<(socket: Socket) => void> = new Array();

    constructor(app: Application, ws: io.Server, namespace?: string) {
        this.app = app;
        this.nsp = (namespace) ? ws.of(namespace) : ws;
    }

    public to(room: string): io.Namespace {
        return this.nsp.to(room);
    }

    public on(eventName: string, listener: (socket: Socket, args?: any) => any): Namespace {
        this.listeners.set(eventName, listener);
        return this;
    }

    public addEventHandler(eventName: string, listener: (socket: Socket, args?: any) => void): Namespace {
        this.nsp.on(eventName, listener);
        return this;
    }

    public onConnect(func: (socket: Socket) => void): Namespace {
        this.onConnectHandlers.push(func);
        return this;
    }

    public send(message: WebSocketMessage) {
        Log.withContext(Namespace.logger, message.correlationId, message.username,
            "message", "out", () => {
                Namespace.logger.info("%s", JSON.stringify(message));
            });
        this.nsp.send(message);
    }

    public emit(event: string, message: WebSocketMessage) {
        Log.withContext(Namespace.logger, message.correlationId, message.username,
            event, "out", () => {
                Namespace.logger.info("%s", JSON.stringify(message));
            });

        this.nsp.emit(event, message);
    }

    public onClientAuthenticated(func: (socket: Socket) => void): Namespace {
        this.onClientAuthenticatedHandler.push(func);
        return this;
    }

    public build(): Namespace {
        this.nsp
            .on("connection", (socket: Socket) => {
                this.registerRunOnConnectHandlers(socket);
            })
            .on("authenticated", (socket: Socket) => {
                this.registerHandlers(socket);
                this.fireOnAuthenticatedHandlers(socket);
            })
            .on("unauthenticated", (socket: Socket, args: any) => {
                Namespace.logger.info("%s Invalid Jwt Token Presented", socket.id);
                socket.emit("unauthenticated", args);
            });
        return this;
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
            this.logMessage(socket, packet);
            next();
        });
    }

    protected logMessage(socket: Socket, packet: Packet) {
        const user = (socket as any).decoded_token.username;
        const event = packet[0];
        const payload = packet[1];

        if (this.isWebSocketMessage(payload)) {
            const jsonPayload = JSON.stringify(payload);
            Log.withContext(Namespace.logger, payload.correlationId,
                user, event, "in", () => {
                    Namespace.logger.info("%s", jsonPayload);
                });
        } else {
            // be careful with this, if sensitive messages does not deserialize to
            // WebSocketMessage it could end up being logged
            try {
                const jsonPayload = JSON.stringify(payload);

                Log.withContext(Namespace.logger, payload.correlationId,
                    user, event, "in", () => {
                        Namespace.logger.warn("Message not in JSON => %s", jsonPayload);
                    });
            } catch (error) {
                Log.withContext(Namespace.logger, payload.correlationId,
                    user, event, "in", () => {
                        Namespace.logger.error("Message not in JSON => %s", error);
                    });
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
