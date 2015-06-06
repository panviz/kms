var fs = require('fs-extra')
, Path = require('path')
, _ = require('lodash')
, config = require('../config')
, Tagman = require('../model/Tagman')

var Self = function () {
  var self = this
  Tagman.all().forEach(function (tag) {
    fs.mkdirpSync(Path.join(config.output_dir, tag))
  })
}

Self.prototype.write = function (page) {
  var self = this

  var filename = Path.join(config.output_dir, page.permalink) + '.html'
  fs.writeFileSync(filename, page.html)
}

module.exports = new Self
