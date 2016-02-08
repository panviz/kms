/**
 * Server API provider
 * endpoint for api.client module
 */
var _ = require('lodash')

var Self = function (p) {
  var self = this
  self.p = p || {}

  self.provider = require('../'+ self.p.provider +'/index')
  self.provider.read(self.p.source)
    .then(function (graph) {
      self.graph = graph
      console.log('Serving items total: ' + graph.getItemKeys().length)
    })
}

Self.prototype.request = function (params) { 
  var self = this
  console.log(params)
  var args = JSON.parse(params.args)
  if (params.method === 'get') {
    return self.provider.get.apply(provider, args)
  } else {
    return new Promise(function (resolve, reject) {
      var result = self.graph[params.method].apply(self.graph, args)
      console.log(result)
      resolve(result)
    })
  }
}

module.exports = Self
