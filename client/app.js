/**
 * Client application is runned in browser
 */
var GraphView = require('../view/graph/index')
, Provider = require('../provider/api.client/index')

var Self = function (p) {
  var self = this

  var providerSet = {
    url: '/test/test.json',
    root: '0a0ae6c7-4cf0-479c-b5be-dd9a4a642870'
  }
  var provider = new Provider(providerSet)
  var viewSet = {
    width: 1000,
    height: 1000
  }
  self.view = new GraphView(viewSet)
  provider.read().then(self._onLoad.bind(self))

  $(self.view).on('show-linked', self._method.bind(self))
}
/**
 * Prepare suitable for api.client json
 */
Self.prototype._convert = function (graph) {
  var self = this
  var obj = {}
  obj.items = _.map(graph.getItems(), function (value, key) {
    return {key: key, value: value}
  })
  obj.links = _.map(graph.getLinksArray(), function (link) {
    return {source: link[0], target: link[1]}
  })
  obj.edges = self._getEdges(obj.items, obj.links)
  return obj
}

Self.prototype._onLoad = function (graph) {
  var self = this
  self.graph = graph
  var vGraph = self._convert(graph)
  self.view.render(vGraph)
}
/**
 * convert d3.js compliant format
 */
Self.prototype._getVisible = function () {
  var items = []
  return items
}

Self.prototype._getEdges = function (items, links) {
  var self = this
  return _.map(links, function (link) {
    var sourceNode = items.filter(function(n) {
      return n.key === link.source
    })[0],
      targetNode = items.filter(function(n) {
        return n.key === link.target
      })[0]

    return {
      source: sourceNode,
      target: targetNode,
      value: link.Value
    }
  })
}

Self.prototype._method = function () {

  self.view.render(graph)
}

new Self
