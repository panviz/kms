var _ = require('lodash')
, DB = require('../associative/index')

var Self = function () {
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

Self.prototype.write = function (obj) {
}

module.exports = new Self
