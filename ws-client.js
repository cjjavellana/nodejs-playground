const io = require('socket.io-client')('http://localhost:8080', {
    reconnection: true
})

io.on('connect', (connected) => {
    console.log("Connected %s", connected)
});

io.on('message', (message) => {
    console.log("Message %s", message)
})

io.on('disconnect', (reason) => {
    console.log("Disconnected %s", reason)
});

io.emit('message', 'The jedi has arrived');

