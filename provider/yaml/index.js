/**
  YAML provider - synchronous
  **human editable** yaml formatted text
  May be used for text only. Appropriate for tags export
 */
var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, yaml = require('js-yaml')
, inflection = require('inflection')
, Graph = require('../graph/index')

var Self = function (p) {
  this.p = p || {}
}
/**
 * Import from yaml formatted string
 * parse yaml key-value as a group
 * but if value is array just link each value item to key
 * @return Graph
 */
Self.prototype.read = function (str) {
  var self = this
  var graph = new Graph

  var data = yaml.load(str)
  //TODO is there a need to create root item?
  var item = graph.set('')
  _.each(data, function (datum2, datum1) {
    if (!datum1 || !datum2) return
    var key1, key2, groupK
    key1 = graph.set(datum1)

    if (!_.isArray(datum2)) {
      key2 = graph.set(datum2)
      groupK = graph.set()
      graph.associate(groupK, [key1, key2])
      graph.associate(item, groupK)
    } else {
      key1 = graph.set(inflection.singularize(datum1))
      datum2.forEach(function (arrayDatum) {
        key2 = graph.set(arrayDatum)
        groupK = graph.set()
        graph.associate(groupK, [key1, key2])
        graph.associate(item, groupK)
      })
    }
  })
  return graph
}
//TODO use native yaml linking feature to not duplicate content
Self.prototype.write = function (graph) {
  var self = this
  if (!self.p.target) console.log("no path specified to write a file")
  else if (!self.p.target.match('yml')) self.p.target = Path.join(self.p.target, 'data.yml')
  var items = {}

  var unlinked = _.difference(_.keys(graph.getItems()), _.keys(graph.getLinksWeightMap()))
  unlinked.forEach(function (item) {
    items[item] = graph.get(item)
  })
  graph.getLinksArray().forEach(function (link) {
    var item1 = graph.get(link[0]) || link[0]
    var item2 = graph.get(link[1]) || link[1]

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  console.log(_.keys(graph.getItems()).length + ' Items to write')
  var yml = yaml.dump(items)
  return yml
}

module.exports = Self
