var _ = require('lodash')
function b(a) {return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

var Self = function () {
  var self = this
  self._items = {}
  self._links = []
}

Self.prototype.set = function (data) {
  var self = this
  , key = b()
  self._items[key] = data
  return key
}

Self.prototype.setUniq = function (data) {
  var self = this
  var key = _.invert(self._items)[data]
  return key || self.set(data)
}

Self.prototype.get = function (key) {
  var self = this
  return self._items[key]
}

//Increase weight if linked twice
Self.prototype.link = function (key1, key2, weight) {
  var self = this
  var link = self.getLink(key1, key2)
  if (link) {
    link[2] = (link[2] || 0) + (weight || 1)
  } else self._links.push([key1, key2, weight])
}

Self.prototype.getLink = function (key0, key1) {
  var self = this
  for (var i = 0; i < self._links.length; i++) {
    if (self._links[i][0] === key0 && self._links[i][1] === key1 || self._links[i][0] === key1 && self._links[i][1] === key0) return self._links[i]
  }
}

Self.prototype.items = function () {
  return this._items
}

Self.prototype.links = function () {
  return this._links
}

module.exports = Self
