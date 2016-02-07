/**
 * JSON key-value provider
 */
var _ = require('lodash')
, Graph = require('../graph/index')

var Self = function () {
}

Self.prototype.readSync = function (obj) {
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

module.exports = new Self
