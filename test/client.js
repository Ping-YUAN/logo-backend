const _ = require('underscore');
const async = require('async');
const net = require('net');
const readline = require('readline');
const WebSocket = require('ws');

module.exports = class Client {
  constructor(port) {
    this._port = port;
  }

  run(commands, done) {
    done = _.once(done);

    var wsClient = new WebSocket('ws://localhost:8124'),
        rl = readline.createInterface({input: wsClient}),
        handshaked = false,
        output = [];

    wsClient.on('open', () => {
      wsClient.send(commands.map(c => c + '\r\n').join('  '));
      wsClient.send('quit\r\n');
      wsClient.close();
    }); 
    wsClient.on('message', (data) => {
      output.push(JSON.parse(data));
    })
    wsClient.on('close', () => {
      done(null, output);
    })

    setTimeout(() => done('timeout'), 1000);
  }
}