var fs = require('fs-extra')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, Storage = require('../associative/index')
, db = require('../../core/db')
, Yaml = require('../yaml/index')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.storage = new Storage()
  self.yaml = new Yaml({target: Path.join(p.target, '_data.yml')})
}

Self.prototype.read = function () {
}

Self.prototype.write = function (storage) {
  var self = this
  if (storage) self.storage = storage
  var tagStorage = self.storage.filter(isNotPath)
  var files = _.difference(self.storage.getKeys(), tagStorage.getKeys())

  files.forEach(function (key) {
    var path = self.storage.get(key)
    , extension = Path.extname(path)
    , root = self.storage.getKey(self.p.root)
    , topLink = self.storage.linked(key)[0]
    , tag2 = self.storage.get(topLink[0])
    , bridgeToRoot = self.storage.findShortestPath(root, topLink[0])
    , tag1 = self.storage.get(bridgeToRoot[1]) || ''
    if (tag2 === self.p.root) tag2 = ''
    var target = Path.join(self.p.target, tag1, tag2, key + extension)
    fs.mkdirsSync(Path.dirname(target))
    fs.copySync(path, target)
  })

  self.yaml.write(tagStorage)
}

function isNotPath(path) {
  return !path.match(/^(\w+:|\\\\|\/)/i)
}
/**
 * filter items to write by Semantic provider
 * leave items with yaml section and with path to file
 */
function filterLinkedText(value) {
  var isText = _.isString(value) && value.match(/---$/mg)// && value.match(/---$/mg).length === 2
  if (isText) return true
}

module.exports = Self
