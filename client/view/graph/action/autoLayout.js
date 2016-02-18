var Action = require('../../../action')
var Self = function () {
  var self = this
  self.id = 'graphAutoLayout'
  self._label = 'Auto Layout'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  G.graphView.toggleAutoLayout()
}

module.exports = Self
