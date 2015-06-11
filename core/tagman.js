/**
 * Tags Manager keeps registry and operates on Tag's instances
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, flatten = require('flat')

var Self = function (renderer) {
  var self = this;

  // hash of all tags saved by key
  self._instances = {}
  self._links = []
}

Self.prototype.add = function (name, url) {
  var self = this
  var key = name.toLowerCase().replace(' ', '-')
  var tag = {key: key, name: name, url: url}
  if (!self._instances[key]) self._instances[key] = tag
  else self._instances[key].url = self._instances[key].url || url
  return tag
}

Self.prototype.parse = function (data) {
  var self = this
  if (_.isString(data)) data = [data]

  _.each(data, function (children, parent) {
    var parent = self.add(parent)
    _.each(children, function (child) {
      var name, url
      if (_.isObject(child)) {
        name = Object.keys(child)[0]
        url = child[name]
      } else {
        name = child
      }
      var tag = self.add(name, url)
      self._links.push({source: parent.key, target: tag.key})
    })
  })
}

Self.prototype.get = function (name) {
  var self = this
  var key = name.toLowerCase().replace(' ', '-')
  return self._instances[key]
}

Self.prototype.all = function (name) {
  var self = this
  return Object.keys(self._instances)
}

module.exports = new Self
