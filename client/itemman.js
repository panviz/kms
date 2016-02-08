/**
 * Visible items manager
 */
var Graph = require('../provider/graph/index')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.graph = new Graph
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.add = function (graph) {
  var self = this

  self.graph.merge(graph)
  var vGraph = self._convert(self.graph)
  self.trigger('change', vGraph)
}
// TODO
Self.prototype.remove = function (graph) {
  var self = this

  var vGraph = self._convert(self.graph)
  self.trigger('change', vGraph)
}
/**
 * Prepare suitable for Views json
 */
Self.prototype._convert = function (graph) {
  var self = this
  var obj = {}
  obj.items = _.map(graph.getItemsMap(), function (value, key) {
    return {key: key, value: value}
  })
  obj.links = _.map(graph.getLinksArray(), function (link) {
    return {source: link[0], target: link[1]}
  })
  obj.edges = self._getEdges(obj.items, obj.links)
  return obj
}
/**
 * @returns Array of formatted edges with nodes reference as source and target
 */
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

module.exports = Self
