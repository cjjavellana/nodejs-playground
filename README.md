# Simple NodeJS 
A playground for demonstrating REST API & Websockets

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