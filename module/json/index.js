/**
 * JSON provider - synchronous
 */
var _ = require('lodash')
, fs = require('fs')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}
/**
 * Reads json object into Associated storage
 * Associate each key with value
 * and if value is array - each element in array - with key
 */
Self.prototype.read = function (obj) {
  _.each(obj, function (value, key) {
    var keyK, valueK
    keyK = DB.set(key)

    if (!_.isArray(value)) {
      var valueK = DB.set(value)
      if (keyK && valueK) DB.associate(keyK, valueK)
    } else {
      value.forEach(function (v) {
        valueK = DB.set(v)
        if (keyK && valueK) DB.associate(keyK, valueK)
      })
    }
  })
}
/**
 * write d3.js compliant format
 */
Self.prototype.write = function () {
  var self = this
  if (!self.p.target) console.log("no path specified to write a file")
  else if (!self.p.target.match('json')) self.p.target = Path.join(self.p.target, 'data.json')

  var obj = {}
  obj.nodes = _.map(db.items(), function (value, key) {
    return {key: key, value: value}
  })
  obj.links = _.map(db.getLinksArray(), function (link) {
    return {source: link[0], target: link[1]}
  })

  console.log(_.keys(db.items()).length + ' Items to write')
  if (self.p.target) fs.writeFileSync(self.p.target, JSON.stringify(obj))
  return obj
}

module.exports = Self
