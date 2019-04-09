import { Application } from "express";
import io, { Packet, Socket } from "socket.io";
import { OutGoingWebSocketMessage } from "../data";

export class Namespace {

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

    public onConnect(func: (socket: Socket) => void): Namespace {
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

    public onClientAuthenticated(func: (socket: Socket) => void): Namespace {
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
            })
            .on("unauthenticated", (socket: Socket, args: any) => {
                console.log("Invalid Jwt Token Presented");
                socket.emit("unauthenticated", args);
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
