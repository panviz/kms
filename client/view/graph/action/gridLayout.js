var Action = require('../../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self.id = 'grid'
  self._deny = false
  self._label = 'Grid'
  self._icon = 'fa fa-th'
  self.group = 'layout'

  self.registrar.on('show', self.enable.bind(self))
  self.registrar.on('hide', self.disable.bind(self))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.registrar.layout = self.registrar.layouts[self.id]
  self.registrar.updatePosition()
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.registrar && self.registrar.isVisible()) self.enable()
  else self.disable()
}

module.exports = Self
