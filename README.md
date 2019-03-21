# Simple NodeJS 
A playground for experiments on nodejs

### Prerequisites
1. Docker & Docker Compose. Get it from <a href="https://docs.docker.com">here</a>

### Debugging
This project contains 2 debug configurations and been configured to be debugged in vscode. See .vscode/launch.json for more details.

### Starting Locally

```bash
$ nodemon app.js
```

### Running Test
```bash
$ npm run test
```

### Starting Dependencies
```
$ docker-compose up -d redis
```