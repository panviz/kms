/**
 * In memory Object storage for Items and Links
 */
var _ = require('lodash')
, dijkstra = require('../../core/dijkstra')

var Self = function () {
  var self = this
  self._items = {}
  self._links = {}
}
/**
 * @param {String | Array} data 
 */
Self.prototype.set = function (data) {
  var self = this
  , key = generateID()

  //Create Group Item and link with children
  if (_.isArray(data)) {
    var groupedIds = data
    //Link grouped Items with Group
    groupedIds.forEach(function (groupedId) {
      self.associate(key, groupedId)
    })
  }
  self._items[key] = data
  return key
}
/**
 * Set Item data or return ID of existing
 * @param {String|Array} data
 * @returns String Item ID
 */
Self.prototype.setUniq = function (data) {
  var self = this
  var key = self.getKey(data)
  return key || self.set(data)
}
/**
 * @param String key Item's ID
 * @return String Item's data
 */
Self.prototype.get = function (key) {
  var self = this
  return self._items[key]
}
/**
 * @param String data of Item
 * @return String ID of Item
 */
Self.prototype.getKey = function (data) {
  var self = this
  return _.invert(self._items)[_.isArray(data) ? data.join(',') : data]
}

Self.prototype.items = function () {
  return this._items
}
/**
 * @return Array of keys
 */
Self.prototype.getKeys = function () {
  return _.keys(this._items)
}
/**
 * Converts self._links map 
 * from: {a:[[b, 3], [c, 1]], b:[[a, 2], [c,1]], c:[[a,4],[b,1]]}
 * to:   {a:{b:3,c:1},b:{a:2,c:1},c:{a:4,b:1}}
 */
Self.prototype.getLinksMap = function () {
  var self = this
  var map = {}
  _.each(self._links, function (links, key) {
    map[key] = {}
    _.each(links, function (link) {
      map[key][link[0]] = link[1]
    })
  })
  return map
}
/**
 * Create link between two Items
 * @param String key1 Item ID
 * @param String key2 Item ID
 * @param Number weight for this link to be increased on
 */
Self.prototype.associate = function (key1, key2, weight) {
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
 * @param {String|Array} key1
 * @param {String|Array} key2
 * @return Number weight of the link
 */
Self.prototype.getLink = function (key1, key2) {
  var self = this
  var linkedTo1 = self._links[key1]
  for (var i = 0; i < linkedTo1.length; i++) {
    if (linkedTo1[i] && linkedTo1[i][0] === key2) return linkedTo1[i][1] || 0
  }
}

Self.prototype.getLInks = function () {
  return this._links
}
/**
 * @return Array of Links
 */
Self.prototype.getLinksArray = function () {
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
/**
 * @param {String|Array} key Item(s) key
 * @return Array Items linked with specified key
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
/**
 * Utilize dijkstra algorythm
 */
Self.prototype.findShortestPath = function (key1, key2) {
  var self = this
  var map = self.getLinksMap()
  return dijkstra.findShortestPath(map, key1, key2)
}
/**
 * @param Function filterer
 * @return Object.Provider new
 */
Self.prototype.filter = function (filterer) {
  var self = this
  var filteredStorage = new Self()
  var items = filteredStorage._items = filterKeys(self._items, filterer)
  var fLinks = filteredStorage._links
  _.each(self._links, function (links, key) {
    if (items[key]) fLinks[key] = _.filter(links, function (link) {
      if (items[link[0]]) return link
    })
  })
  return filteredStorage
}

function filterKeys(obj, filter) {
  var filtered = {}
  var keys = []
  _.each( obj, function(value, key) {
    if (filter(value)) {
      filtered[key] = value
    }
  })
  return filtered
}
//Compare two Links
function compareWeight(link1, link2) {
  return link1[1] > link2[1] ? 1 : -1
}
//generate random UUID
function generateID(a) {return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateID)}

module.exports = Self
