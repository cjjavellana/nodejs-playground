const uuid = require('uuid')
const io = require('socket.io-client')('http://localhost:8080?user=cjavellana', {
    transports: ['websocket']
})

nsp = {}

io.on('connect', (connected) => {
    console.log("WebSocket Connected")

    io.emit('authenticate', {
        'correlationId': uuid.v4(),
        'token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." + 
            "eyJ1c2VybmFtZSI6ImFhYSIsImlhdCI6MTU1NDYzMjgyNSwiZXhwIjoxNTU0Njc2MDI1LCJhdWQiOiJodHRwczovL2NqYXZlbGxhbmEubWUiLCJpc3MiOiJDamF2ZWxsYW5hIiwic3ViIjoiYWFhIn0" + 
            ".HQ9anVCfltPHA7j3hrHpYRLGjN5o2AUnJfmzMIgItnY3wUJVjKuZoaA9gHxMmC2oQRkqYuT0scxt7Nh7oF6tgHi4gGR4lmeSZR1LLxJe_MkFnjiF1V8imzlrHtaqg4Vjr2TovMLpBr3PcAZT65TiB-O3s5AYnwNhjJC_guiiNfE"
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

