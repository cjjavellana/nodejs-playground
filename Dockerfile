FROM node:11.0

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm install && npm run-script build
