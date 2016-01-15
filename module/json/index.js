/**
 * JSON provider - synchronous
 */
var _ = require('lodash')
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

Self.prototype.write = function () {
  var obj = {}
  obj.nodes = _.map(db.items(), function (value, key) {
    return {key: key, value: value}
  })
  obj.links = _.map(db.getLinksArray(), function (link) {
    return {source: link[0], target: link[1]}
  })

  return obj
}

module.exports = Self
