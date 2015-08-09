// var cheerio = require('cheerio');
// var Promise = require('bluebird');
// var request = require('request');
// var async = require("async");
// var requestAsync = Promise.promisify(request);
// var BBQ = require("bluebird-queue");
// var fs = require("fs");
// var mongoose = require('mongoose');
// var Page = mongoose.model('Page');
// Promise.promisifyAll(request);
// Promise.promisifyAll(fs);


// var robotstxt = "";

// var createPage = function(page, href) {
// 	return Page.create({
// 			url: page.url + href
// 		})
// 		.then(function(childPage) {
// 			return Page.findByIdAndUpdate(page._id, {
// 				$addToSet: {
// 					links: childPage._id
// 				}
// 			});
// 		})
// 		.then(null, function(err) {
// 			return Page.findOneAndUpdate({
// 				url: page.url + href
// 			}, {
// 				$inc: {
// 					pageRank: 1
// 				}
// 			});
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