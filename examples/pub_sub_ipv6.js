/*
 *
 * Publisher subscriber pattern using IPv6 address
 *
 */

var cluster = require('cluster')
  , zmq = require('../')
  , port = 'tcp://::1:12345';

if (cluster.isMaster) {
  for (var i = 0; i < 2; i++) cluster.fork();

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
  
  //publisher = send only
  
  var socket = zmq.socket('pub');

  socket.identity = 'publisher' + process.pid;
  
  if (zmq.ZMQ_IPV4ONLY) {
    try {
      socket.setsockopt(zmq.ZMQ_IPV4ONLY, 0);
    } catch (e) {
      console.log('error: can\'t setsockopt ZMQ_IPV4ONLY');
    }
  }

  var stocks = ['AAPL', 'GOOG', 'YHOO', 'MSFT', 'INTC'];

  socket.bind(port, function(err) {
    if (err) throw err;
    console.log('bound!');
    
    setInterval(function() {
      var symbol = stocks[Math.floor(Math.random()*stocks.length)]
        , value = Math.random()*1000;

      console.log(socket.identity + ': sent ' + symbol + ' ' + value);
      socket.send(symbol + ' ' + value);
    }, 100);
  });
} else {
  //subscriber = receive only
  
  var socket = zmq.socket('sub');

  socket.identity = 'subscriber' + process.pid;
  if (zmq.ZMQ_IPV4ONLY) {
    try {
      socket.setsockopt(zmq.ZMQ_IPV4ONLY, 0);
    } catch (e) {
      console.log('error: can\'t setsockopt ZMQ_IPV4ONLY');
    }
  }
  
  socket.connect(port);
  
  socket.subscribe('AAPL');
  socket.subscribe('GOOG');

  console.log('connected!');

  socket.on('message', function(data) {
    console.log(socket.identity + ': received data ' + data.toString());
  });
}