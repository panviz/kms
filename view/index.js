var GraphView = require('./graph')
, Provider = require('../module/linkedText.api/index')

var Self = function (p) {
  var self = this

  var viewSet = {
    width: 1000,
    height: 1000
  }
  var provider = new Provider({url: '/test/linkedText/'})
  new GraphView(viewSet, provider)
}

new Self
