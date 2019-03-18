import WebSocket from "ws";

export const register = (wss: WebSocket.Server) => {
    wss.on("connection", (socket: WebSocket) => {
        // connection is up, let's add a simple simple event
        socket.on("message", (message: string) => {

            // log the received message and send it back to the client
            console.log("received: %s", message);
            socket.send(`Hello, you sent -> ${message}`);
        });

        // send immediatly a feedback to the incoming connection
        socket.send("Hi there, I am a WebSocket server");
    });

};
