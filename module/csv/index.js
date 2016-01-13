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
        var groups = _.map(row, function (col, index) {
          return col ? db.set([titles[index], db.set(col)]) : undefined
        })
        groups = _.compact(groups)
        db.set(groups)
      })
      resolve(db)
    })
  })
}

Self.prototype.write = function (storage) {
  var self = this
}

module.exports = Self
