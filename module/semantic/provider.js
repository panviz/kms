var fs = require('fs-extra')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, Storage = require('../object/provider')
, Yaml = require('../yaml/provider')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.storage = new Storage()
  self.p.output = Path.join(p.target, 'output')
  self.yaml = new Yaml({target: self.p.output})
}

Self.prototype.read = function () {
}

Self.prototype.write = function (storage) {
  var self = this
  if (storage) self.storage = storage
  var items = self.storage.items()
  var binary = findAllKeys(items, isPath)
  var text = findAllKeys(items, filterText)
  var tags = _.difference(_.keys(items), binary, text)

  binary.forEach(function (key) {
    var path = self.storage.get(key)
    , extension = Path.extname(path)
    , root = self.storage.getKey(self.p.root)
    , topLink = self.storage.linked(key)[0]
    , tag2 = self.storage.get(topLink[0])
    , bridgeToRoot = self.storage.findShortestPath(root, topLink[0])
    , tag1 = self.storage.get(bridgeToRoot[1]) || ''
    if (tag2 === self.p.root) tag2 = ''
    var target = Path.join(self.p.target, tag1, tag2, key + extension)
    console.log(target);
    //fs.copySync(path, target)
  })
}

function isPath(path) {
  return path.match(/^(\w+:|\\\\|\/)/i)
}
/**
 * filter items to write by Semantic provider
 * leave items with yaml section and with path to file
 */
function filterText(value) {
  var isText = _.isString(value) && value.match(/---$/mg)// && value.match(/---$/mg).length === 2
  if (isText) return true
}

function findAllKeys(obj, filter) {
  var keys = []
  _.each( obj, function(value, key) {
    if (filter(value)) {
      keys.push(key)
    }
  })
  return keys
}

module.exports = Self
