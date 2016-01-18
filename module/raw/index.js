/*
 * Raw provider
 * writes items in one folder with IDs as filenames
 */
var fs = require('fs')
, Path = require('path')
, _ = require('lodash')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}

Self.prototype.write = function () {
  var self = this
  if (!self.p.target) return console.log("no path specified to write a file")
  _.each(db.items(), function (value, key) {
    var path = Path.join(self.p.target, key)
    var str = value == undefined ? '' : value
    fs.writeFileSync(path, str)
  })

  console.log(_.keys(db.items()).length + ' Items written')
}

module.exports = Self
