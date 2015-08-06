var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = require('request');
var requestAsync = Promise.promisify(request);
var BBQ = require("bluebird-queue");
var fs = require("fs");
var mongoose = require('mongoose');
var Page = mongoose.model('Page');
Promise.promisifyAll(request);
Promise.promisifyAll(fs);


var robotstxt = "";

var createPage = function(page, href) {
	return Page.create({
			url: page.url + href
		})
		.then(function(childPage) {
			return Page.findByIdAndUpdate(page._id, {
				$addToSet: {
					links: childPage._id
				}
			});
		})
		.then(null, function(err) {
			return Page.findOneAndUpdate({
				url: page.url + href
			}, {
				$inc: {
					pageRank: 1
				}
			});
		})
};

var getLinks = function(page, options) {
	for (var i = 0; i < robotstxt.length; i++) {
		if (page.url.indexOf(robotstxt[i]) !== -1) {
			return;
		}
	}
	var pageQueue = new BBQ({
		concurrency: 10
	});
	return requestAsync(page.url)
		.then(function(res) {
			if (!res) return;
			var $ = cheerio.load(res[0].body);
			var links = [];
			var anchorTags = $("a");
			anchorTags.each(function() {
				var href = $(this).attr('href');
				if (href) {
					if (options.relative) {
						if (href.match(/^\/[^/]/)) {
							links.push(page.url + href);
							pageQueue.add(createPage.bind(null, page, href));
						}
					}
				}
			});
			// console.log(page.links)
			return pageQueue.start().then(function() {
				return Page.findById(page._id).populate("links");
			});
		});
};

var starting_url = "https://en.wikipedia.org";

var linksQueue = new BBQ({
	concurrency: 1,
	delay: 15000
});

var iterate = function(page) {
	return getLinks(page, {
			relative: true
		})
		.then(function(oldPage) {
			console.log(oldPage.links);
			oldPage.links.forEach(function(link) {
				linksQueue.add(iterate(link));
			});
		})
		.then(null, function(err) {
			console.log("error", err);
		});
};

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

			return iterate(page);
		})
		.then(function() {
			linksQueue.start();
		})
		.then(function() {
			console.log("this ended?!?!");
		});
};