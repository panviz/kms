/**
 * CSV provider
 */
var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, csv = require('csv')
, Graph = require('../graph/index')

var Self = function (p) {
  this.p = p || {}
}
/**
 * parse each line as Item
 * TODO mark (link) each item with its itemtype
 */
Self.prototype.read = function () {
  var self = this
  var graph = new Graph

  var data = fs.readFileSync(self.p.source, 'utf8')
  return new Promise(function (resolve, reject) {
    csv.parse(data, function (err, data) {
      var headers = data.shift()
      var titles = _.map(headers, function (header) {
        return graph.set(header)
      })
      data.forEach(function (row) {
        var columnHeaderGroups = _.map(row, function (columnValue, index) {
          if (!columnValue) return
          var columnKey = graph.set(columnValue)
          var columnHeaderGroup = graph.set()
          graph.associateGroup(columnHeaderGroup, [titles[index], columnKey])
          graph.findByKeys([titles[index], columnKey])
          return columnHeaderGroup
        })
        columnHeaderGroups = _.compact(columnHeaderGroups)
        var rowGroup = graph.set()
        graph.associateGroup(rowGroup, columnHeaderGroups)
      })
      resolve(graph)
    })
  })
}

Self.prototype.write = function () {
  var self = this
}

module.exports = Self
