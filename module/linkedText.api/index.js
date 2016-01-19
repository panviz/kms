/**
 * Local item manager
 */
var Self = function (p) {
  var self = this
  self.p = p || {}
  self._items = []
  self._links = []

  //d3.json('/test/test.json', self._onJSONLoad.bind(self))
  self.loadLinkedItem('0a0ae6c7-4cf0-479c-b5be-dd9a4a642870')
}

Self.prototype.items = function () {
  var self = this
  return self._items
}

Self.prototype.edges = function () {
  var self = this
  return _.map(self._links, function (link) {
    var sourceNode = self._items.filter(function(n) {
      return n.key === link.source
    })[0],
      targetNode = self._items.filter(function(n) {
        return n.key === link.target
      })[0]

    return {
      source: sourceNode,
      target: targetNode,
      value: link.Value
    }
  })
}

Self.prototype.loadLinkedItem = function (key) {
  var self = this
  self.loadItem(key).then(function (str) {
    var data = str.split('---')
    var toLoad = JSON.parse(data[1])
    toLoad.forEach(function (key) {
      self.loadItem(key)
    })
  })

  //return promise
}

Self.prototype.loadItem = function (key) {
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

Self.prototype._onJSONLoad = function (error, graph) {
  var self = this
  if (error) throw error
  self._items = graph.nodes
  self._links = graph.links
  $(self).trigger('update')
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
