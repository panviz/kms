/**
 * In memory Associative storage for Items and Links
 * Links are stored in redundant format: each item's key has array of its links
 * Link is an array of key and weight
 */
var _ = require('lodash')
, dijkstra = require('../../core/dijkstra')

var Self = function () {
  var self = this
  self._items = {}
  self._links = {}
}
/**
 * TODO make order of items in array insignificant
 * Doesn't allow override.
 * @param String data single value
 * @param Array data Array of values
 * @param Array data Array of IDs
 * @return Key ID for existing item if any
 */
Self.prototype.set = function (data) {
  if (!data) return
  var self = this
  if (_.isArray(data)) return self.setGroup(data)

  var key = self.getKey(data) || generateID()
  self._items[key] = data
  return key
}
//Create Group Item and link with children
Self.prototype.setGroup = function (data) {
  var self = this
  if (_.isEmpty(data)) return

  var groupKeys = _.map(data, function (datum) {
    return datum.match(idPattern) ? datum : self.set(datum)
  })
  var key = self.getKey(groupKeys) || generateID()
  //Link grouped Items with Group
  groupKeys.forEach(function (groupKey) {
    self.associate(key, groupKey)
  })
  
  self._items[key] = groupKeys
  return key
}
/**TODO deprecated
 * Set Item data or return Key of existing
 * @param {String|Array} data
 * @returns Key Item ID
 */
Self.prototype.setUniq = function (data) {
  var self = this
  var key = self.getKey(data)
  return key || self.set(data)
}
/**
 * @param Key Item ID
 * @return String Item data
 */
Self.prototype.get = function (key) {
  var self = this
  return self._items[key]
}
/**
 * @return Object all stored items
 */
Self.prototype.items = function () {
  return this._items
}
/**
 * Get key of item by data if it exists
 * @param String data of Item
 * @return Key of Item
 */
Self.prototype.getKey = function (data) {
  var self = this
  var value = _.isArray(data) ? data.join(',') : data
  
  return _.invert(self._items)[value]
}
/**
 * @return Key of Item with group meaning
 */
Self.prototype.findGroup = function (data) {
  var self = this
  if (!_.isArray(data)) throw 'Group can be found by multiple values only'
  var keys = _.map(data, function (datum) {
    return self.getKey(datum)
  })
  return self.getKey(keys)
}
/**
 * @return Array of keys
 */
Self.prototype.getAllItems = function () {
  return _.keys(this._items)
}
/**
 * Create link between two Items
 * @param Key Item ID
 * @param Key Item ID
 * @param Number weight for this link to be increased on
 */
Self.prototype.associate = function (key1, key2, weight) {
  var self = this
  , linkedTo1 = self._links[key1]
  , linkedTo2 = self._links[key2]
  , skip
  weight = weight || 0

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

Self.prototype.getLinks = function () {
  return this._links
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
 * @param Key Item key
 * @return Array of links of provided Item
 */
Self.prototype.links = function (key) {
  var self = this
  return self._links[key]
}
/**
 * @param {String|Array} key Item(s) key
 * @return Array of distinct Items linked with specified Item(s)
 */
Self.prototype.linked = function (key) {
  var self = this
  return _.map(self.links(key), function (link) {
    return link[0]
  })
}
Self.prototype.groupLinked = function (key) {
  var self = this
  var ownKeys = self.get(key)
  var linked = self.linked(key)
  return _.difference(linked, ownKeys)
}
/**
 * Find items linked with specified 
 */
Self.prototype.findByKeys = function (keys) {
  var self = this
  if (!_.isArray(keys)) keys = [keys]

  var arrLinkedKeys = _.map(keys, function (key) {
    return self.linked(key)
  })
  return _.intersection.apply(_, arrLinkedKeys)
}
/** convenient way to find by values
 */
Self.prototype.findByValues = function (values) {
  var self = this
  if (!_.isArray(values)) values = [values]

  var keys = _.map(values, function (value) {
    return self.getKey(value)
  })
  return self.findByKeys(keys)
}
//find by values or keys
Self.prototype.find = function (data) {
  var self = this
  if (!_.isArray(data)) data = [data]

  var keys = _.map(data, function (datum) {
    return datum.match(idPattern) ? datum : self.getKey(datum)
  })
  return self.findByKeys(keys)
}
Self.prototype.find = function (data) {
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

Self.prototype.guess = function () {
  var self = this
  var func = arguments[0]
  var args = Array.prototype.slice.call(arguments, 1)
  var keys = _.map(args, function (arg) {
    return self.getKey(arg)
  })
  var result = func.apply(self, keys)
  return self.log(result)
}

Self.prototype.log = function (obj) {
  var self = this
  var str = JSON.stringify(obj)
  str = self._replaceIds(str)
  console.log(str)
  return JSON.parse(str)
}

Self.prototype._replaceIds = function (str) {
  var self = this
  var recurse = false

  var ids = str.match(idPattern)
  ids.forEach(function (id) {
    var value = self.get(id)
    if (_.isArray(value)) recurse = true
    str = str.replace(id, value)
  })
  return recurse ? self._replaceIds(str) : str
}

function filterKeys(obj, filter) {
  var filtered = {}
  var keys = []
  _.each( obj, function (value, key) {
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

var idPattern = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/g

module.exports = Self
