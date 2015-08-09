'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Page = mongoose.model('Page');

module.exports = router;


router.get('/', function(req, res, next) {
  Page.find({})
    .then(function(pages) {
      res.json(pages);
    })
    .then(null, function(err) {
      next(err);
    });

});