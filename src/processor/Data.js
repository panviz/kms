var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, config = require('../config')

var DB = require('../Storage')

var Self = function () {
  var self = this
  self.read()
}

Self.prototype.read = function () {
  var self = this

  var files = glob.sync(Path.join(config.content_dir, 'data/*'))
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(filename, 'utf8')
    var data = yaml.load(s, 'utf8')
    DB.setData(name, data)
  })
}

module.exports = new Self
