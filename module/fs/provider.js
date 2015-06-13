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
  var self = this
  self.p = p || {}
  self.storage = new Storage()
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
  self.tagIds = {}

  files.forEach(self.findTagDuplicates.bind(self))
  files.forEach(self.parse.bind(self))
  //console.log(self.duplicates);
  //console.log(_.keys(self.duplicates).sort())
  return self.storage
}

Self.prototype.findTagDuplicates = function (path) {
  var self = this
  var relative = Path.relative(self.inDir, path)
  var names = self._getTagsFromPath(path)

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
  var names = self._getTagsFromPath(path)
  var items = []

  names.forEach(function (name, index) {
    //Disable Groups for development simplicity
    //skip folders in the root for composing Groups
    //if (index > 0 && _.contains(_.keys(self.duplicates), name)) {
      //items[items.length -1] = [items[items.length -1], name]
    //} else 
      items.push(name)
  })

  //add text content
  if (!fs.lstatSync(path).isDirectory()) {
    var content = isbinaryfile(path) ? path : fs.readFileSync(path, 'utf8')
    if (content !== '') {
      items.push(content)
    }
  }

  self.parseSequence(items)
}
//Link parent-child
Self.prototype.parseSequence = function (items) {
  var self = this
  items.forEach(function (item, index) {
    if (_.isArray(item)) {
      var groupedIds = self.parseGroup(item)
      var groupId = self.storage.setUniq(groupedIds)
      self.tagIds[groupId] = groupId

      //replace array with ID
      items[index] = groupId
    } else {
      self.tagIds[item] = self.storage.setUniq(item)
    }

    //Link parent-child folders
    if (items[index -1]) {
      self.storage.link(self.tagIds[items[index]], self.tagIds[items[index -1]])
    }
  })
}
/**
 * save grouped Items
 * @returns Array grouped Items ids
 */
Self.prototype.parseGroup = function (items) {
  var self = this
  var groupedItemIds = []
  items.forEach(function (item, index) {
    self.tagIds[item] = self.storage.setUniq(item)
    groupedItemIds.push(self.tagIds[item])
  })
  return groupedItemIds
}

Self.prototype._getTagsFromPath = function (path) {
  var self = this
  var relative = Path.relative(self.inDir, path)
  //ignore file extension
  if (!fs.lstatSync(path).isDirectory()) {
    relative = relative.replace(Path.extname(path), '')
  }
  var tags = relative.split(/[\\\/\.]+/)
  if (self.p.root) tags.unshift(self.p.root)
  return tags
}

module.exports = Self
