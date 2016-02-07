/**
 * CSV provider
 */
var _ = require('lodash')
, Path = require('path')
, csv = require('csv')
, Graph = require('../graph/index')

var Self = function () {}
/**
 * parse each line as Item
 */
Self.prototype.read = function (source, p) {
  var self = this
  var graph = new Graph

  return new Promise(function (resolve, reject) {
    var root = graph.set()

    csv.parse(source, function (err, rows) {
      var headers = rows.shift()
      var titles = _.map(headers, function (header) {
        return graph.set(header)
      })
      rows.forEach(function (row) {
        var rowItem = graph.set()
        _.each(row, function (value, index) {
          if (!value) return
          var valueKey = graph.set(value)
          graph.associate(valueKey, titles[index])
          graph.associate(valueKey, rowItem)
        })
        graph.associate(rowItem, root)
      })
      resolve(graph)
    })
  })
}

Self.prototype.write = function () {
  var self = this
}

module.exports = new Self
