var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: {
    type: String
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  pageRank: {
    type: Number,
    default: 1
  },
  links: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page'
    }]
  }
});

module.exports = mongoose.model('Page', schema);
