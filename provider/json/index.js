/**
 * JSON graph dump provider
 */
var _ = require('lodash')
, Graph = require('../graph/index')

var Self = function () {
}
/**
 * Reads json object into Associated storage
 * Associate each key with value
 * and if value is array - each element in array - with key
 */
Self.prototype.readSync = function (obj) {
  return new Graph(obj)
}

Self.prototype.read = function (obj) {
  var self = this
  return new Promise(function (resolve, reject) {
    resolve(self.readSync(obj))
  })
}
/**
 * write json same as in associative module
 */
Self.prototype.write = function (graph) {
  return graph.toJSON()
}

module.exports = new Self
