const net = require('net');
const client = new net.Socket();
const config = {
    host: '0.0.0.0',
    port: 9670,
    exclusive: true,
}
const timeout = 3000;
let retrying = false;
// Functions to handle client events
// connector
function makeConnection() {
  client.connect(config.port, config.host);
}
function connectEventHandler() {
  console.log('***** connected ******');
  console.log({
    port: client.remotePort,
    host: client.remoteAddress,
  }, 'connected to server');
  retrying = false;
}

function errorEventHandler(e) {
  console.log(`Connection error ${e.code}`);
  if (!retrying) {
    retrying = true;
  }
  setTimeout(makeConnection, timeout);
}
function closeEventHandler() {
  if (retrying) return false;
  console.log('Server closed');
  console.log(`Reconnecting... in ${timeout / 1000} Seconds`);
  if (!retrying) {
    retrying = true;
  }
  return setTimeout(makeConnection, timeout);
}
// Start Eevent Listeners
client.on('connect', connectEventHandler);
client.on('error', errorEventHandler);
client.on('close', closeEventHandler);

// Connect to remote server
console.log('***** connecting ******');
makeConnection();

module.exports = client;