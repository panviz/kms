var Action = require('../../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self.id = 'radial'
  self._deny = false
  self._label = 'Radial'
  self._icon = 'fa fa-circle-o'
  self.group = 'layout'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.view.layout = self.view.layouts[self.id]
  self.view.updatePosition()
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.view && self.view.isFocused()) self.enable()
  else self.disable()
}

module.exports = new Self
