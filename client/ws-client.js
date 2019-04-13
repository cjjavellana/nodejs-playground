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
                'token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NTE1OTYzNiwiZXhwIjoxNTU1MjAyODM2LCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0.Fcr-3b3ZWnfOSXSYhRcswMTHLzp-mCyYQEz8Y7mwWRKAbrV1CMyTf1mnBn2nC1_Qa-SjBgIXD5_B9MxnpVrfBYD5LQ3aCDss4_ee38MGgHVCDrORVHc9zlS8XaSEjcFUwNyZ-W4xbuTwxZFVm8MCabS47bUNSNCVck3ex7UNfJw"
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
            io.emit("message", {
                "correlationId": uuid.v4(),
                "message": message
            });
        }

        callback();
    });

/**
 * myapp$ emit afterInitDemo "Hello World"
 */
vorpal.command("emit <event> <message>")
    .option('-n, --namespace <namespace>', 'The namespace to dispatch a \'message\' to.')
    .action(function (args, callback) {
        console.log(args);
        let message = args.message;
        let event = args.event;

        if (args.options.namespace &&
            args.options.namespace !== '/') {

            let namespace = args.options.namespace;
            let nspRef = globalNspHolder[namespace];

            if (nspRef) {
                console.log("Sending %s to %s %s", message, event, namespace);
                nspRef.emit(event, message);
            } else {
                console.log("Namespace %s does not exist", namespace);
            }
        } else {
            io.emit(event, message);
        }

        callback();
    });

vorpal
    .delimiter('myapp$')
    .show();