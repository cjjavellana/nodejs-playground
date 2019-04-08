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
                'token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NDY3Nzg2NywiZXhwIjoxNTU0NzIxMDY3LCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0.Q-gGiYGZRChpl8thXVB46HGDi_oLIWqV1IwGmoCDntoc2cTFWBBxZY_tM6wdC9f5tYuGIqP7quzrB2SXjezk_1C4v0Ri2i33fBOzqWM_79k_qzFZaLPy5D146AiB3XN9lxMg98c8-ifq9yRIAlGMrQxfDfNL1hYpKwq-xEqJ4pk"
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
            // remove leading slash
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

// nsp = {}

// io.on('connect', (connected) => {
//     console.log("WebSocket Connected")

//     io.emit('authenticate', {
//         'correlationId': uuid.v4(),
//         'token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." + 
//             "eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NDYzMjgyNSwiZXhwIjoxNTU0Njc2MDI1LCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0" + 
//             ".HQ9anVCfltPHA7j3hrHpYRLGjN5o2AUnJfmzMIgItnY3wUJVjKuZoaA9gHxMmC2oQRkqYuT0scxt7Nh7oF6tgHi4gGR4lmeSZR1LLxJe_MkFnjiF1V8imzlrHtaqg4Vjr2TovMLpBr3PcAZT65TiB-O3s5AYnwNhjJC_guiiNfE"
//     });

// });

// io.on('message', (message) => {
//     console.log("Message %s", message);
// })

// io.on('connectToNsp', (message) => {
//     console.log('Subscribing to namespace: ' + message.namespace);
//     let nsp = require('socket.io-client')('http://localhost:8080' + message.namespace, {
//         transports: ['websocket']
//     });
//     nsp.on('message', (m) => {
//         console.log(m)
//     })

//     nsp[message.namespace] = nsp;
// })

// io.on('OnUploadCompleteEvent', (message) => {
//     console.log("OnUploadCompleteEvent %s", message)
// })

// io.on('disconnect', (reason) => {
//     console.log("Disconnected %s", reason)
// });

// io.emit('message', 'The jedi has arrived');

