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

  // hash of all data items saved by id
  self._instances = {}
}

Self.prototype.set = function (tags) {
  var self = this

  if (_.isObject(tags)) tags = self.parse(tags)
  if (!_.isArray(tags)) tags = [tags]

  tags.forEach(function (tag) {
    if (_.isString(tag)) name = tag
    var name = name.toLowerCase()
    self._instances[name] = name
  })
}

/**
 * @returns tag if specified id or array of all items
 */
Self.prototype.get = function (name) {
  var self = this

  if (name) return self._instances[name]
  return Object.keys(self._instances)
}
//TODO temporary solution
Self.prototype.parse = function (o) {
  var flat = flatten(o)
  , tags = []

  _.values(flat).forEach(function (v) {
    if (!_.isArray(v) && !v.match(/\w\.\w/)) tags.push(v)
  })
  
  _.keys(flat).forEach(function (k) {
    tags = _.union(tags, k.split('.'))
  })

  return _.reject(_.uniq(_.compact(tags)), isNumeric)
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = new Self
