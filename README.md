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