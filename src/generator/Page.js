var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, rimraf = require('rimraf')
, mkdirp = require('mkdirp')
, config = require('../config')

var Self = function () {
  var self = this

  rimraf.sync(config.output_dir)
}

Self.prototype.write = function (page) {
  var self = this
  , path
  , filename

  if (page.single) {
    path = Path.join(config.output_dir, page.permalink, '..')
    filename = Path.join(config.output_dir, page.permalink) + '.html'
  } else {
    path = Path.join(config.output_dir, page.permalink)
    filename = Path.join(path, 'index.html')
  }

  mkdirp.sync(path)
  fs.writeFileSync(filename, page.html)
}

module.exports = new Self
