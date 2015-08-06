var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = require('request');
var requestAsync = Promise.promisify(request);
var fs = require("fs");
var mongoose = require('mongoose');
var Page = mongoose.model('Page');
Promise.promisifyAll(request);
Promise.promisifyAll(fs);

var robotstxt = "";


var getLinks = function(page, options) {
	for (let i = 0; i < robotstxt.length; i++) {
		if (page.url.indexOf(robotstxt[i]) !== -1) {
			console.log(robotstxt[i]);
			return;
		}
	}

	return requestAsync(page.url)
		.then(function(res) {
			if (!res) return;
			var $ = cheerio.load(res[0].body);
			var links = [];
			var anchorTags = $("a");
			anchorTags.each(function(i) {
				var href = $(this).attr('href');
				if (href) {
					if (options.relative) {
						if (href.match(/^\/[^/]/)) {
							links.push(page.url + href);
							Page.create({
									url: page.url + href
								})
								.then(function(childPage) {
									page.links.push(childPage._id);
							console.log(i, anchorTags.length);
									if (i == 257) {
										page.save();
										console.log("saved");
									}
								});
						}
					}
				}
			});
			// console.log(page.links)

			return links;
		});
};

var starting_url = "https://en.wikipedia.org";
module.exports = function() {
	return Page.remove().then(function() {
			return fs.readFileAsync("./robots.txt");
		})
		.then(function(data) {
			robotstxt = data.toString().match(/Disallow:\s.*/g);
			robotstxt = robotstxt.map(function(disallow) {
				return disallow.slice(10);
			});
			return Page.create({
				url: starting_url
			});
		}).then(function(page) {
			return getLinks(page, {
				relative: true
			});
		})
		.then(function(links) {
			// console.log(links);
			return Page.findOne({
				url: starting_url
			}).exec();
		})
		.then(function(page) {
			console.log(page);
			console.log(page.links.length);
		})
		.then(null, function(err) {
			console.log(err);
		});
};