const express = require('express');
const client = require('./tcp/client');
const EventEmitter = require('events');

class OnDataEmitter extends EventEmitter { }
const OnData = new OnDataEmitter();

const app = express()

// TCP Client data event listener that handles data event by the client.
client.on('data', (data) => {
  const code = data.toString().slice(0,3)
  OnData.emit(code, data.toString())
});


app.get(('/'), async (req, res) => {
    const code = req.query.statusCode;
    let status = false
    OnData.on(code, (data)=>{
        status = true
        res.send({data})
        OnData.removeAllListeners(code);
    })

    // set a timeout to remove listener and send timeout response if the TCP server fails to reply
    setTimeout(()=>{
        if(status) return true;
        // Clear the enevnt listener to void memory leaks
        OnData.removeAllListeners(code);
        res.send({error: 'timedout'})
    }, 2000)
    client.write(code)
});

app.listen(8090,()=>console.log('Server listening on http://localhost:8090'))