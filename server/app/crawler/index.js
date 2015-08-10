var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = require('request');
var requestAsync = Promise.promisify(request);
var SSPPQ = require("./SelfSortPriorityQueue");
var BBQ = require("bluebird-queue");
var fs = require("fs");
var mongoose = require('mongoose');
var Page = mongoose.model('Page');
Promise.promisifyAll(request);
Promise.promisifyAll(fs);
var events = require("events");

var crawlEmitter = require("../../io/eventEmitter.js");

var io;
var robotstxt = "";

var stop = false;

var createPage = function(page, href) {
	if (stop) return;
	var childPage;
	console.log(href);
	return Page.create({
			url: starting_url + href
		})
		.then(function(cP) {
			childPage = cP;
			return Page.findByIdAndUpdate(page._id, {
				$addToSet: {
					links: childPage._id
				},
				$set: {
					title: page.title
				}
			});

		})
		.then(function() {
			crawlEmitter.emit("newNode", childPage);
			setTimeout(function() {
				crawlEmitter.emit("link", {source: page._id, target: childPage._id});
			}, 100);
		})
		.then(null, function(err) {
			// linksQueue.queue.update(page._id, 1);
			return Page.findOneAndUpdate({
				url: starting_url + href
			}, {
				$inc: {
					pageRank: 1
				}
			}).exec();
		})
		.then(function(updatedPage) {
			if(updatedPage) {
				crawlEmitter.emit("grow", updatedPage._id);
			}
		});
};
var getLinks = function(page, options) {
	if (stop) return;
	for (var i = 0; i < robotstxt.length; i++) {
		if (page.url.indexOf(robotstxt[i]) !== -1) {
			return;
		}
	}
	var pageQueue = new BBQ({
		concurrency: 1,
		delay: 600
	});
	return requestAsync(page.url)
		.then(function(res) {
			if (!res) return;
			var $ = cheerio.load(res[0].body);
			var links = [];
			var anchorTags = $("a");
			var title = $("head title").text();
			title = title.slice(0, title.length - 35);
			console.log(title);
			page.title = title;
			anchorTags.each(function() {
				var href = $(this).attr('href');
				if (href) {
					if (options.relative) {
						if (href.match(/^\/[^/]/) && !href.match(/[:?#]/)) {
							links.push(starting_url + href);
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
	delay: 500
});

var iterate = function(page) {
	if (stop) return;
	return getLinks(page, {
			relative: true
		})
		.then(function(oldPage) {
			oldPage.links.forEach(function(link) {
				linksQueue.add(iterate.bind(null, link));
			});
		})
		.then(null, function(err) {
			console.log("error", err);
		});
};

module.exports = {
	crawl: function(url) {
		io = require('../../io')();
		return Page.remove().then(function() {
				return fs.readFileAsync("./robots.txt");
			})
			.then(function(data) {
				robotstxt = data.toString().match(/Disallow:\s.*/g);
				robotstxt = robotstxt.map(function(disallow) {
					return disallow.slice(10);
				});
				return Page.create({
					url: url
				});
			}).then(function(page) {
				crawlEmitter.emit("newNode", page);
				return iterate(page);
			})
			.then(function() {
				linksQueue.start();
			})
			.then(function() {
				console.log("this ended?!?!");
			});
	},
	stop: function() {
		stop = true;
		setTimeout(function() {
			stop = false;
		}, 5000);
		linksQueue.drain();
		return new Promise(function(resolve, reject){resolve(); });
	}
};


// module.exports = function() {
// 	var pagesQueue = new SSPPQ({
// 		concurrency: 100
// 	});

// 	var getTitle = function(page) {
// 		return requestAsync(page.url)
// 		.then(function(res) {
// 			if (!res[0]) return console.log("no res");
// 			var $ = cheerio.load(res[0].body);
// 			var title = $("title").text();
// 			if (!title) return console.log("no title");
// 			page.title = title.slice(0, title.length - 35);
// 			console.log(page.title);
// 			return page.save();
// 		})
// 		.then(null, function(err) {
// 			console.log(err);
// 		});
// 	};

// 	Page.find({pageRank: {$gte: 2}, title: {$exists: false}})
// 	.then(function(pages) {
// 		pages.map(function(page) {
// 			pagesQueue.add(getTitle.bind(null, page));
// 		});
// };

// var getLinks = function(page, options) {
// 	for (var i = 0; i < robotstxt.length; i++) {
// 		if (page.url.indexOf(robotstxt[i]) !== -1) {
// 			return;
// 		}
// 	}
// 	var pageQueue = new BBQ({
// 		concurrency: 10
// 	});
// 	return requestAsync(page.url)
// 		.then(function(res) {
// 			if (!res) return;
// 			var $ = cheerio.load(res[0].body);
// 			var links = [];
// 			var anchorTags = $("a");
// 			anchorTags.each(function() {
// 				var href = $(this).attr('href');
// 				if (href) {
// 					if (options.relative) {
// 						if (href.match(/^\/[^/]/)) {
// 							links.push(page.url + href);
// 							pageQueue.add(createPage.bind(null, page, href));
// 						}
// 					}
// 				}
// 			});
// 			// console.log(page.links)
// 			return pageQueue.start().then(function() {
// 				return Page.findById(page._id).populate("links");
// 			});
// 		});
// };

// var starting_url = "https://en.wikipedia.org";

// var linksQueue = new BBQ({
// 	concurrency: 1,
// 	delay: 15000
// });

// var iterate = function(page) {
// 	return getLinks(page, {
// 			relative: true
// 		})
// 		.then(function(oldPage) {
// 			console.log(oldPage.links);
// 			oldPage.links.forEach(function(link) {
// 				linksQueue.add(iterate(link));
// 			});
// 		})
// 		.then(null, function(err) {
// 			console.log("error", err);
// 		});
// };

// module.exports = function() {
// 	return Page.remove().then(function() {
// 			return fs.readFileAsync("./robots.txt");
// 		})
// 		.then(function(data) {
// 			robotstxt = data.toString().match(/Disallow:\s.*/g);
// 			robotstxt = robotstxt.map(function(disallow) {
// 				return disallow.slice(10);
// 			});
// 			return Page.create({
// 				url: starting_url
// 			});
// 		}).then(function(page) {

// 			return iterate(page);
// 		})
// 		.then(function() {
// 			linksQueue.start();
// 		})
// 		.then(function() {
// 			console.log("this ended?!?!");
// 		});
// };


// module.exports = function() {
// 	var pagesQueue = new BBQ({
// 		concurrency: 100
// 	});

// 	var getTitle = function(page) {
// 		return requestAsync(page.url)
// 		.then(function(res) {
// 			if (!res[0]) return console.log("no res");
// 			var $ = cheerio.load(res[0].body);
// 			var title = $("title").text();
// 			if (!title) return console.log("no title");
// 			page.title = title.slice(0, title.length - 35);
// 			console.log(page.title);
// 			return page.save();
// 		})
// 		.then(null, function(err) {
// 			console.log(err);
// 		});
// 	};

// // 	Page.find({pageRank: {$gte: 2}, title: {$exists: false}})
// // 	.then(function(pages) {
// // 		pages.map(function(page) {
// // 			pagesQueue.add(getTitle.bind(null, page));
// // 		});
// // 		return pagesQueue.start();
// // 	})
// // 	.then(function() {
// // 		console.log("done");
// // 	})
// // 	.then(null, function(err) {
// // 		console.log(err);
// // 	});
// // };