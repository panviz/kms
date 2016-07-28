/**
 * JSON graph dump provider
 */
const Graph = require('../graph/index')

const Self = function () {
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
  return new Promise((resolve, reject) => {
    resolve(this.readSync(obj))
  })
}
/**
 * write json same as in associative module
 */
Self.prototype.write = function (graph) {
  return graph.toJSON()
}

module.exports = new Self
