/**
 * Server API provider
 * endpoint for api.client module
 */
import _ from 'lodash'
import Raw from '../raw/index'

export default function Self(p) {
  var self = this
  self.p = p || {}

  self.provider = Raw
  self.provider.read(self.p.source)
    .then(function (graph) {
      self.graph = graph
      console.log('Serving items total: ' + graph.getItemKeys().length)
    })
}

Self.prototype.request = function (params) {
  var self = this
  console.log('Request params: ' + JSON.stringify(params))
  var args = JSON.parse(params.args)
  var result = self.graph[params.method](...args)

  return new Promise(function (resolve, reject) {
    if (params.method === 'get') {
      args.push(self.p)

      // TODO handle items (binary) not in the graph
      self.provider.get(...args)
        .then(function (data) { resolve(data)})
    } else if (params.method === 'set') {
      self.provider.set(result, self.graph.get(result), self.graph.getLinks(result), self.p)
      resolve(result)
    } else if (_.includes(['associate', 'remove', 'setDisassociate'], params.method)) {

      // TODO _.includes(params.method, 'set')
      _.each(result, function (key) {

        // TODO do not write items not in the graph (they may be just external links)
        self.provider.set(key, self.graph.get(key), self.graph.getLinks(key), self.p)
      })
      resolve(result)
    } else {

      //TODO store searches to provider
      resolve(result)
    }
  })
}
