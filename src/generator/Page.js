var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, mkdirp = require('mkdirp')
, config = require('../config')
, Tagman = require('../model/Tagman')

var Self = function () {
  var self = this
  Tagman.all().forEach(function (tag) {
    mkdirp.sync(Path.join(config.output_dir, tag))
  })
}

Self.prototype.write = function (page) {
  var self = this

  var filename = Path.join(config.output_dir, page.permalink) + '.html'
  fs.writeFileSync(filename, page.html)
}

module.exports = new Self
