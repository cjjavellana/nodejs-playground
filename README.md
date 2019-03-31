# Simple NodeJS 
A playground for demonstrating REST API & Websockets

## The app.locals
This section describes the services made available through ```app.locals```

1. app.locals.io - The socket.io service. An instance of ```io.Server```

2. app.locals.redis - The redis client. For retrieving from and caching to a redis service

3. app.locals.eventEmitter - The internal event emitter instance. Used for inter-module communication
   within the application

4. app.locals.jwt - The Jwt service instance. Used for encrypting & decrypting security token.

## Events
This section describes the events dispatched internally which can be subscribed to

1. OnUploadCompleteEvent
   
   The time it takes to process an uploaded file varies as a function of the contents of the file being processed. In addition to that, http requests are only allowed to remain open for 30-60 sec depending on your k8's configuration.

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

### Starting Dependencies
```
$ docker-compose up -d redis mock
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
```

