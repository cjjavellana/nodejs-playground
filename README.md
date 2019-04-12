# NodeJS Playground

A playground for experimenting with:

1. REST routes

2. JWT Authentication & Validation

3. Websocket (Socket.IO) Channel

## The app.locals

This section describes the services made available through ```app.locals```

1. app.locals.io - The socket.io service. An instance of ```io.Server```

2. app.locals.redis - The redis client. For retrieving from and caching to a redis service

3. app.locals.eventEmitter - The internal event emitter instance. Used for inter-module communication
   within the application

4. app.locals.jwt - The Jwt service instance. Used for encrypting & decrypting security token.

## REST API

## Websockets

### Establishing connection through websockets

To connect to the application's websockets channel, emit an ```authenticate``` event passing a random request id and the token obtained by a previous call to ```/api/v1/login```

In client
```javascript
const uuid = require('uuid')
const io = require('socket.io-client')('http://localhost:8080?user=foobar', {
    transports: ['websocket']
})

io.on('connect', (connected) => {
    io.emit('authenticate', {
        'requestId': uuid.v4(),
        'token': 'bbb'
    });
});
```
Where ```token``` is the token returned by a call to ```/api/v1/login```

After token is verified, the server will emit a ```connectToNsp``` event instructing the client to subscribe to security group namespaces.

```javascript
nsp = {}
io.on('connectToNsp', (message) => {
    let nsp = require('socket.io-client')('http://localhost:8080' + message.namespace, {
        transports: ['websocket']
    });

    nsp.on('message', (m) => {
        console.log(m)
    })

    nsp[message.namespace] = nsp;
})
```

### Supported Namespaces & Their Corresponding Events

#### /admin namespace

A namespace for admin users

1. ```systemUtilization``` - An event fired every 5 seconds to broadcast system related metrics

Subscribing to ```systemUtilization``` event.

```javascript
nsp.on('systemUtilization', (metrics: Metrics) => {
    // handle broadcasted message
})
```

## /trader namespace

A namespace for trader users

## Internal Events

This section describes the events dispatched internally which can be subscribed to

1. OnUploadCompleteEvent

   The time it takes to process an uploaded file varies as a function of the contents of the file being processed. In addition to that, http requests in k8 is open for 30-60 sec before it's terminated by the cluster's HAProxy.

   To address the above mentioned issues without resorting to long polling, we make use of redis as the medium of communication between this service and the downstream processor. This service subscribes to a redis channel ```OnUploadCompleteEvent``` and internally rebroadcasts the messages it receives through ```events.EventEmitter```.

   Components responsible for propagating the results to the user subscribe to an internal event ```OnUploadCompleteEvent```. 

   In ```notifications.ts```

   ```typescript
   redisSubcriber.on("message", (channel: string, message: string) => {
        if (channel === "OnUploadCompleteEvent") {
            eventEmitter.emit("OnUploadCompleteEvent", message);
        }
    });

    redisSubcriber.subscribe("OnUploadCompleteEvent");
   ```

   In ```websockets.ts```

   ```typescript
    eventEmitter.on("OnUploadCompleteEvent", (message: string) => {
        ioServer.emit("OnUploadCompleteEvent", message);
    });
   ```

   In ```client.js```

   ```javascript
   io.on('OnUploadCompleteEvent', (message) => {
       // handle message
   })
   ```

### Prerequisites

1. Docker & Docker Compose. Get it from <a href="https://docs.docker.com">here</a>

### Debugging

This project contains 2 debug configurations and been configured to be debugged in vscode. 

See .vscode/launch.json for more details.

### Starting Locally

```bash
$ nodemon app.js
```

### Running Test

```bash
$ npm run test
```

## Dependencies

1. Downstream Mocks

    * Mock service for downstream services  
    * Exposed through port 9090 (see docker-compose.yml)

2. Redis

    * Exposed through redis default port 6379 (see docker-compose.yml).

3. RabbitMQ

    * Used for inter-service communication

4. ELK

    * Where logs are stored and analyzed
    * Elastic search can be accessed at http://localhost:9200
    * Kibana can be accessed at http://localhost:5601
    * Logstash running a TCP input plugin is listening at localhost:4718

### Starting Dependencies

To start the dependencies

```bash
$ docker-compose up -d redis mock rabbitmq elk
```

To view the logs
```bash
$ docker-compose logs -f elk
```

### Generating keys for RS256

```bash
# Generating private key. Dont put passphrase
$ ssh-keygen -t rsa -b 1024 -m PEM -f jwtRS256.key
# Creating public key
$ openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

### Test Requests

Authentication

```bash
$ curl -X POST -H 'Content-Type: application/json' -v http://localhost:8080/api/v1/login -d '{"username": "aaa", "password": "test"}'
> POST /api/v1/login HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.54.0
> Accept: */*
> Content-Type: application/json
> Content-Length: 39
>
* upload completely sent off: 39 out of 39 bytes
< HTTP/1.1 200 OK
< X-Powered-By: Express
< X-Auth-Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NDY3NzQyNywiZXhwIjoxNTU0NzIwNjI3LCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0.XZY5kkRqLQpnn_hooygAJqejwWEoM6SKrZyiO1C-sL679XvN_1ZrvKLj4XCNIBVn35_wW-d-z55KPcVmTz2205kCW5DPtjSs76mMkfdBhiLd__s3jugbJ-Tg7LRuT3q4mz8-W0ZfQE8iHgbx54zdzTX6x0o3SAWKxyX6eGv0bGg
< Content-Type: application/json; charset=utf-8
< Content-Length: 170
< ETag: W/"aa-w+JM3HPlXYWAeW0m3dU9QogokPQ"
< Date: Sun, 07 Apr 2019 22:50:27 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
{"message":{"username":"aaa","permissions":[{"module":"equities-healthcare","name":"search","authority":1},{"module":"equities-aviation","name":"search","authority":0}]}}
```