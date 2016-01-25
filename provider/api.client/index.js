/**
 * Web API provider for client to access server
 * TODO would be made rich on processing like Graph module, when browser couldn't handle all items
 * TODO how to manage loaded/visible items
 */
var Graph = require('../graph/index')

var Self = function (p) {
  var self = this
  self.p = p || {}
}
/**
 */
Self.prototype.read = function () {
  var self = this

  return new Promise(function (resolve, reject) {
    //self.getLinkedItem(self.p.root)
    d3.json(self.p.url, function (data) {
      var graph = new Graph(data)
      resolve(graph)
    })
  })
}

Self.prototype.get = function (key) {
  var self = this
  var promise = new Promise(function (resolve, reject) {
    var request = $.get(self.p.url + key)
    request.then(function (str) {
      self._onLoad(key, str)
      resolve(str)

      $(self).trigger('update')
    })
  })
  return promise
}

Self.prototype.getLinkedItem = function (key) {
  var self = this
  self.get(key).then(function (str) {
    var data = str.split('---')
    var toLoad = JSON.parse(data[1])
    toLoad.forEach(function (key) {
      self.get(key)
    })
  })

  //return promise
}

Self.prototype._onLoad = function (key, str) {
  var self = this
  var data = str.split('---')
  var item = _.find(self._items, {key: key})
  if (!item) {
    item = {key: key}
    self._items.push(item)
  }
  item['value'] = data[2]
  var linked = JSON.parse(data[1])
  //add links to others only if they are already loaded
  linked.forEach(function (key2) {
    if (_.find(self._items, {key: key2})) {
      self._links.push({source: key, target: key2})
    }
  })
}

module.exports = Self
