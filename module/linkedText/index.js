/*
 * Same as Raw provider but only for text
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}

Self.prototype.read = function () {
  var self = this

  var linksMap = {}
  self.files = _.map(glob.sync('*', {cwd: self.p.source}), function (key) {
    var str = fs.readFileSync(Path.join(self.p.source, key), 'utf8')
    var data = str.split('---')
    linksMap[key] = JSON.parse(data[1])
    db.set(data[2], key)
  })
  _.each(linksMap, function (linked, key) {
    db.associateGroup(key, linked)
  })
  return new Promise(function (resolve, reject) {
    resolve(db)
  })
}
/**
 * Writes items in one folder with IDs as filenames
 * Start of file contains '---' separated section with JSON dump of links
 */
Self.prototype.write = function () {
  var self = this
  if (!self.p.target) return console.log("no path specified to write a file")
  _.each(db.items(), function (value, key) {
    var path = Path.join(self.p.target, key)
    var str = value == undefined ? '' : value
    str = '---\n' + JSON.stringify(db.linked(key)) + '\n---\n' + str
    try {
    fs.writeFileSync(path, str)
    } catch(e) {console.log(e)}
  })

  console.log(_.keys(db.items()).length + ' Items written')
}

module.exports = Self
