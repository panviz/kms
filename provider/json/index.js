/**
 * JSON provider - synchronous
 */
var _ = require('lodash')
, fs = require('fs')
, Graph = require('../graph/index')

var Self = function (p) {
  this.p = p || {}
}
/**
 * Reads json object into Associated storage
 * Associate each key with value
 * and if value is array - each element in array - with key
 */
Self.prototype.read = function (obj) {
  var graph = new Graph

  _.each(obj, function (value, key) {
    var keyK, valueK
    keyK = graph.set(key)

    if (!_.isArray(value)) {
      var valueK = graph.set(value)
      if (keyK && valueK) graph.associate(keyK, valueK)
    } else {
      value.forEach(function (v) {
        valueK = graph.set(v)
        if (keyK && valueK) graph.associate(keyK, valueK)
      })
    }
  })
  return graph
}
/**
 * write json same as in associative module
 */
Self.prototype.write = function (graph) {
  var self = this
  if (!self.p.target) console.log("no path specified to write a file")
  else if (!self.p.target.match('json')) self.p.target = Path.join(self.p.target, 'data.json')

  var obj = {
    items: graph.getItems(),
    //TODO changed name
    links: graph.getLinksMap()
  }

  console.log(_.keys(graph.getItems()).length + ' Items to write')
  if (self.p.target) fs.writeFileSync(self.p.target, JSON.stringify(obj))
  return obj
}

module.exports = Self
