/**
 * CSV provider
 */
var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, csv = require('csv')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}
/**
 * parse each line as Item
 */
Self.prototype.read = function () {
  var self = this
  var data = fs.readFileSync(self.p.source, 'utf8')
  return new Promise(function (resolve, reject) {
    csv.parse(data, function (err, data) {
      var headers = data.shift()
      var titles = _.map(headers, function (header) {
        return db.set(header)
      })
      data.forEach(function (row) {
        var columnHeaderGroups = _.map(row, function (columnValue, index) {
          if (!columnValue) return
          var columnKey = db.set(columnValue)
          var columnHeaderGroup = db.set()
          db.associateGroup(columnHeaderGroup, [titles[index], columnKey])
          db.findByKeys([titles[index], columnKey])
          return columnHeaderGroup
        })
        columnHeaderGroups = _.compact(columnHeaderGroups)
        var rowGroup = db.set()
        db.associateGroup(rowGroup, columnHeaderGroups)
      })
      resolve(db)
    })
  })
}

Self.prototype.write = function () {
  var self = this
}

module.exports = Self
