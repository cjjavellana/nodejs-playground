# NodeJS Client

## Emit Sample

```bash
christian-mbp15:client cjavellana$ node ws-client.js
myapp$ wsconnect
Hurray! We're connected to WebSocket
myapp$ Subscribing to namespace: /admin
Message Received Welcome to the simple nodejs server.
Use of this server is monitored for security purposes.
Welcome to the /admin namespace
myapp$ emit afterInit "Hello World"
{ options: {}, event: 'afterInit', message: 'Hello World' }
myapp$
```