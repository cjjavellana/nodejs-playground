const io = require('socket.io-client')('http://localhost:8080?user=cjavellana', {
    transports: ['websocket']
})

io.on('connect', (connected) => {
    console.log("WebSocket Connected")

    io.emit('authenticate', JSON.stringify({
        'token': 'bbb'
    }));
});

io.on('message', (message) => {
    console.log("Message %s", message)
})

io.on('OnUploadCompleteEvent', (message) => {
    console.log("OnUploadCompleteEvent %s", message)
})

io.on('disconnect', (reason) => {
    console.log("Disconnected %s", reason)
});

io.emit('message', 'The jedi has arrived');

