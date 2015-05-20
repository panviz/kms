var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, config = require('../config')
, Processor = require('../Processor')
, DB = require('../Storage')
, Page = require('../model/Page')

var Self = function () {
  var self = this

  self.specialSections = ['data']
  self.sections = _.map(glob.sync('*/', {cwd: 'content'}), function (path) {
    return path.replace('/', '')
  })
  self.sections = _.difference(self.sections, self.specialSections)
  _.each(self.sections, function (section) {
    self.processSection(section)
  })
}
Self.prototype = Object.create(Processor.prototype)

Self.prototype.processSection = function (section) {
  var self = this

  var folderPath = Path.join(config.content_dir, section)
  var files = glob.sync('**/*.html', {cwd: folderPath})

  _.each(files, function (filename) {
    var page = self.read(Path.join(folderPath, filename))
    DB.setPage(page)
  })
}

Self.prototype.read = function (path) {
  var self = this

  var s = fs.readFileSync(path, 'utf8')
  if (!s) return
  var parsed = self.parse(s)
  var path = Path.relative(config.content_dir, path)
  return new Page(path, parsed, config)
}

module.exports = new Self
