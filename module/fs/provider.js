/**
 * Imports files and directories tree into Repository
 */
var fs = require('fs-extra')
, Path = require('path')
, _ = require('lodash')
, glob = require('glob')
, Storage = require('../object/provider')
, isbinaryfile = require('isbinaryfile')

var Self = function (p) {
  this.p = p || {}
  this.storage = new Storage()
}

/*
  find duplicates
  parse path to have grouped parts
  create Items for every path part
  create Groups
  connect Group with children
  connect path parts (with groups) with each other
*/
Self.prototype.read = function () {
  var self = this
  self.inDir = Path.normalize(self.p.source || '.')
  self.outDir = Path.normalize(self.p.target || '.')
  var files = glob.sync(Path.join(self.inDir, '**/*'))

  var counter = 0
  self.tagPaths = {}
  self.items = {}
  self.duplicates = {}
  self.pathItems = {}
  self.tagIds = {}

  files.forEach(self.findTagDuplicates.bind(self))
  files.forEach(self.parse.bind(self))
  //console.log(self.duplicates);
  //console.log(_.keys(self.duplicates).sort())
  //console.log(pathItems);
  console.log(self.storage._items);
  console.log(self.storage._links);
  return self.storage
}

Self.prototype.findTagDuplicates = function (path) {
  var self = this
  var relative = Path.relative(self.inDir, path)
  var names = relative.split(Path.sep)
  var last = names[names.length -1]
  names[names.length -1] = last.split('.')[0]

  var last = _.last(names)
  if (self.tagPaths[last]) {
    if (!self.duplicates[last]) self.duplicates[last] = []
    if (!_.contains(self.duplicates[last], self.tagPaths[last])) self.duplicates[last].push(self.tagPaths[last])
    self.duplicates[last].push(relative)
  }
  self.tagPaths[last] = relative
}

Self.prototype.parse = function (path) {
  var self = this
  var relative = Path.relative(self.inDir, path)
  var names = relative.split(Path.sep)
  var last = names[names.length -1]
  //remove extension
  names[names.length -1] = last.split('.')[0]
  var items = []

  names.forEach(function (name) {
    if (_.contains(_.keys(self.duplicates), name)) {
      items[items.length -1] = items[items.length -1] + 'ü‘„€€€' + name
    } else items.push(name)
  })

  //add text content
  if (!fs.lstatSync(path).isDirectory()) {
    var content = isbinaryfile(path) ? path : fs.readFileSync(path, 'utf8')
    if (content !== '') {
      items.push(content)
    }
  }

  self.pathItems[relative] = items
  self.parseSequence(items)
}
//Link parent-child
Self.prototype.parseSequence = function (items) {
  var self = this
  items.forEach(function (tag, index) {
    self.tagIds[tag] = self.storage.setUniq(tag)
    if (items[index -1]) {
      self.storage.link(self.tagIds[tag], self.tagIds[items[index -1]])
    }
    var group = tag.split('ü‘„€€€')
    if (group.length > 1) {
      self.parseSequence(group)
    }
  })
}

module.exports = Self
