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

  return new Promise(function (resolve, reject) {
    var data = fs.readFileSync(self.p.source, 'utf8')
    var filename = Path.basename(self.p.source, '.csv')
    var root = graph.set(filename)

    csv.parse(data, function (err, rows) {
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

module.exports = Self
