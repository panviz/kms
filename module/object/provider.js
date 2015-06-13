var _ = require('lodash')
, dijkstra = require('../../core/dijkstra')

var Self = function () {
  var self = this
  self._items = {}
  self._links = {}
  //self._links = []
}
/**
 * @param data String or Array
 */
Self.prototype.set = function (data) {
  var self = this
  , key = generateID()

  //Create Group Item and link with children
  if (_.isArray(data)) {
    var groupedIds = data
    //Link grouped Items with Group
    groupedIds.forEach(function (groupedId) {
      self.link(key, groupedId)
    })
  }
  self._items[key] = data
  return key
}
/**
 * @param {String|Array} data
 * @returns String Item ID
 */
Self.prototype.setUniq = function (data) {
  var self = this
  var key = self.getKey(data)
  return key || self.set(data)
}

Self.prototype.get = function (key) {
  var self = this
  return self._items[key]
}
/**
 * @param key1 String Item ID
 * @param key2 String Item ID
 * @param weight Number weight for this link to be increased on
 */
Self.prototype.link = function (key1, key2, weight) {
  var self = this
  , linkedTo1 = self._links[key1]
  , linkedTo2 = self._links[key2]
  , skip

  if (!linkedTo1) linkedTo1 = self._links[key1] = []
  if (!linkedTo2) linkedTo2 = self._links[key2] = []

  //check if link exists and increment weight if does
  linkedTo1.forEach(function (link) {
    if (link && link[0] === key2){
      link[1] = (link[1] || 0) + (weight || 1)
      return skip = true
    }
  })

  if (!skip) {
    linkedTo1.push([key2, weight])
    linkedTo2.push([key1, weight])
  }
  linkedTo1.sort(compareWeight)
  linkedTo2.sort(compareWeight)
}
/**
 * @return Number weight of the link
 */
Self.prototype.getLink = function (key1, key2) {
  var self = this
  var linkedTo1 = self._links[key1]
  for (var i = 0; i < linkedTo1.length; i++) {
    if (linkedTo1[i] && linkedTo1[i][0] === key2) return linkedTo1[i][1] || 0
  }
}

Self.prototype.getLinks = function () {
  var self = this
  var visited = {}
  var all = []
  _.each(self._links, function (linked, key1) {
    linked.forEach(function (link) {
      var key2 = link[0]
      if (!visited[key1] || !visited[key2]) all.push([key1, key2])
      visited[key2] = true
    })
    visited[key1] = true
  })
  return all
}

Self.prototype.items = function () {
  return this._items
}
/**
 * @return Array Items linked with specified key
 * @param key String|Array Item(s) key
 */
Self.prototype.linked = function (key) {
  var self = this
  if (!_.isArray(key)) return self._links[key]
  var keys = key

  //TODO
  return _.difference(_.map(keys, function (key) {
    return self._links[key]
  }))
}

Self.prototype.getKey = function (data) {
  var self = this
  return _.invert(self._items)[_.isArray(data) ? data.join(',') : data]
}
/**
 * dijkstra algorythm operates with map, so we need to convert format
 * from: {a:[[b, 3], [c, 1]], b:[[a, 2], [c,1]], c:[[a,4],[b,1]]}
 * to:   {a:{b:3,c:1},b:{a:2,c:1},c:{a:4,b:1}}
 */
Self.prototype.findShortestPath = function (key1, key2) {
  var self = this
  var map = {}
  _.each(self._links, function (links, key) {
    map[key] = {}
    _.each(links, function (link) {
      map[key][link[0]] = link[1]
    })
  })
  return dijkstra.findShortestPath(map, key1, key2)
}

function compareWeight(link1, link2) {
  return link1[1] > link2[1] ? 1 : -1
}

function generateID(a) {return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateID)}

module.exports = Self
