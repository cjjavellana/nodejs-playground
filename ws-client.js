const uuid = require('uuid')
const io = require('socket.io-client')('http://localhost:8080?user=cjavellana', {
    transports: ['websocket']
})

nsp = {}

io.on('connect', (connected) => {
    console.log("WebSocket Connected")

    io.emit('authenticate', {
        'requestId': uuid.v4(),
        'token': 'bbb'
    });
});

io.on('message', (message) => {
    console.log("Message %s", message);
})

io.on('connectToNsp', (message) => {
    console.log('Subscribing to namespace: ' + message.namespace);
    let nsp = require('socket.io-client')('http://localhost:8080' + message.namespace, {
        transports: ['websocket']
    });
    nsp.on('message', (m) => {
        console.log(m)
    })

    nsp[message.namespace] = nsp;
})

io.on('OnUploadCompleteEvent', (message) => {
    console.log("OnUploadCompleteEvent %s", message)
})

io.on('disconnect', (reason) => {
    console.log("Disconnected %s", reason)
});

io.emit('message', 'The jedi has arrived');

