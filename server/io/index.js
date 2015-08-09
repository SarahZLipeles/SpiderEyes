'use strict';
var socketio = require('socket.io');
var crawlEmitter = require("./eventEmitter.js");
var io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio.listen(server);

    io.on('connection', function (socket) {
    	console.log("hello");
        crawlEmitter.on('newNode', function(data) {
        	console.log("KSFLJGHLKSDJHG");
        	socket.emit('newNode', data);
        });
        crawlEmitter.on('link', function(data) {
        	console.log("SKJDFGHLKSJDHFGLKJSDFHL");
        	socket.emit('link', data);
        });
    });
    
    return io;

};
