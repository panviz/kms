var fs = require('fs-extra')
, Path = require('path')
, _ = require('lodash')
, glob = require('glob')
, yaml = require('js-yaml')

var Self = function (p) {
  this.init(p)
}

Self.prototype.init = function (p) {
  var self = this
  p = p || {}
  self.inDir = Path.normalize(p.inDir || '.')
  self.outDir = Path.normalize(p.outDir || '.')
  var files = glob.sync(Path.join(self.inDir, '**/*'))

  var counter = 0
  self.tagPaths = {}
  self.items = {}
  self.duplicates = {}
  self.pathTags = {}

  files.forEach(self.findTagDuplicates.bind(self))
  files.forEach(self.parseTags.bind(self))
  files.forEach(self.parse.bind(self))
  //console.log(_.keys(self.duplicates).sort())
  //console.log(pathTags);
  self.writeTags()
}

Self.prototype.findTagDuplicates = function (path) {
  var self = this
  if (!fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(self.inDir, path)
  var tags = relative.split(Path.sep)

  var last = _.last(tags)
  if (self.tagPaths[last]) {
    if (!self.duplicates[last]) self.duplicates[last] = []
    if (!_.contains(self.duplicates[last], self.tagPaths[last])) self.duplicates[last].push(self.tagPaths[last])
    self.duplicates[last].push(relative)
  }
  self.tagPaths[last] = relative
}

Self.prototype.parse = function (path) {
  var self = this
  if (fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(self.inDir, path)
  var out = Path.join(self.outDir, relative)
  fs.copySync(path, out)
}

Self.prototype.parseTags = function (path) {
  var self = this
  if (!fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(self.inDir, path)
  var folders = relative.split(Path.sep)
  var tags = []

  folders.forEach(function (folder) {
    if (_.contains(_.keys(self.duplicates), folder)) {
      tags[tags.length -1] = tags[tags.length -1] + '.' + folder
    } else tags.push(folder)
  })

  self.pathTags[relative] = tags

  tags.forEach(function (tag, index) {
    if (tags[index + 1]) {
      if (!self.items[tag]) self.items[tag] = []
      self.items[tag].push(tags[index + 1])
    }
  })
}

Self.prototype.writeTags = function () {
  var self = this
  _.keys(self.items).forEach(function (tag) {
    self.items[tag] = _.uniq(self.items[tag])
  })
  var yml = yaml.dump(self.items)
  fs.writeFileSync(Path.join(self.outDir, 'data.yml'), yml)
}

module.exports = Self
