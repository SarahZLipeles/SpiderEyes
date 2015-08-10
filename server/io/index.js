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
        	socket.emit('newNode', data);
        });
        crawlEmitter.on('link', function(data) {
        	socket.emit('link', data);
        });
        crawlEmitter.on('grow', function(data) {
            socket.emit('grow', data);
        });
    });
    
    return io;

};
