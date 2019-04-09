const uuid = require("uuid");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const vorpal = require("vorpal")();
const shell = require("shelljs");

var globalNspHolder = {};
var io;

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("Node f*cking JS", {
                font: "Ghost",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
}

init();

vorpal
    .command('wsconnect', 'Opens a websocket connection')
    .action(function (args, callback) {
        io = require('socket.io-client')('http://localhost:8080?user=cjavellana', {
            transports: ['websocket']
        });
        io.on('connect', () => {
            console.log("Hurray! We're connected to WebSocket");

            io.emit('authenticate', {
                'correlationId': uuid.v4(),
                'token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NDgxNTA3MCwiZXhwIjoxNTU0ODU4MjcwLCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0.T8YzQ6SNedbFZ1ODa7pfeVqPkIaacj7ssmoodAKv8AO3h0Q91Q54q9cuYcq_JwnEGvaaGKkwyAAEbw3NkRVF9iZ1WAJhsrGpgS4jq9e6nVjEww3cpA5Kdm2Yb9bP-RUVWbsl0bk2o9k-Ch9O4WK9fb5VvzYaVUdw_-PVw4XDKOI"
            });

            callback();
        });

        io.on('unauthenticated', (message) => {
            console.log("Invalid Jwt Token");
        })

        io.on('message', (message) => {
            console.log("Message Received %s", message);
        });

        io.on('connectToNsp', (message) => {
            console.log('Subscribing to namespace: ' + message.namespace);
            let nsp = require('socket.io-client')('http://localhost:8080' + message.namespace, {
                transports: ['websocket']
            });
            nsp.on('message', (m) => {
                console.log(m)
            })

            globalNspHolder[message.namespace] = nsp;
        })
    });

vorpal.command("sendmessage <message>")
    .option('-n, --namespace <namespace>', 'The namespace to dispatch a \'message\' event to.')
    .action(function (args, callback) {
        console.log(args);
        let message = args.message;

        if (args.options.namespace &&
            args.options.namespace !== '/') {

            let namespace = args.options.namespace;
            let nspRef = globalNspHolder[namespace];

            if (nspRef) {
                console.log("Sending %s to %s", message, namespace);
                nspRef.emit("message", message);
            } else {
                console.log("Namespace %s does not exist", namespace);
            }
        } else {

            io.emit("message", message);
        }

        callback();
    })

vorpal
    .delimiter('myapp$')
    .show();