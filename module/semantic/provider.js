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
  var binary = findAllKeys(items, existsPath)
  var text = findAllKeys(items, filterText)
  var tags = _.difference(_.keys(items), binary, text)

  binary.forEach(function (key) {
    var path = self.storage.get(key)
    var extension = Path.extname(path)
    var topLink = self.storage.linked(key)[0]
    var tag = self.storage.get(topLink[0])
    var target = Path.join(self.p.target, tag, key + extension)
    console.log(target);
    //fs.copySync(path, target)
  })
}
function existsPath(path) {
  try { fs.statSync(path); return true }
  catch (er) { return false }
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
