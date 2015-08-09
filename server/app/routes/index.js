'use strict';
var router = require('express').Router();
var crawler = require('../crawler');
module.exports = router;

router.use('/members', require('./members'));
router.use('/pages', require('./pages'));

router.post('/crawl', function(req, res, next) {
  crawler.crawl(req.body.startingUrl)
    .then(function(res) {
      res.json(res)
    })
    .then(null, function(err) {
      next(err);
    });
})

router.get('/crawl/stop', function(req, res, next) {
  crawler.stop()
    .then(function() {
      res.send("stopped")
    })
    .then(null, function(err) {
      next(err);
    });
})

// Make sure this is after all of
// the registered routes!
router.use(function(req, res) {
  res.status(404).end();
});