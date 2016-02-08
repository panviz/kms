/**
 * Web API provider for client to access server
 * TODO cache loaded graph
 */
var Graph = require('../graph/index')

var Self = function (p) {
  var self = this
  self.p = p || {}
}
BackboneEvents.mixin(Self.prototype)
/**
 * DEPRECATED
 * the whole repository shouldn't be transfered to the client
 */
Self.prototype.read = function () {
  var self = this

  return new Promise(function (resolve, reject) {
    //self.getLinkedItem(self.p.root)
    d3.json(self.p.url, function (data) {
      var graph = new Graph(data)
      resolve(graph)
    })
  })
}
/**
 * translate graph function calls to server
 */
Self.prototype.request = function (method) {
  var self = this
  var args = JSON.stringify(Array.prototype.slice.apply(arguments).slice(1))
  var promise = new Promise(function (resolve, reject) {
    var request = $.post({
      url: self.p.url,
      data: {
        method: method,
        args: args,
      },
    })
    request.then(function (data) {
      if (data.items && data.links) data = new Graph(data)
      resolve(data)
    })
  })
  return promise
}

module.exports = Self
