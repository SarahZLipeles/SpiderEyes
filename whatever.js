var Promise = require('bluebird');
var request = require('request');
var requestAsync = Promise.promisify(request);



requestAsync("http://en.wikipedia.org")
	.then(function(res) {
		console.log(res[0]);
	});