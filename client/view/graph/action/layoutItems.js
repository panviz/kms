var Action = require('../../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self._deny = false
  self.id = 'graphLayoutItems'
  self._label = 'Layout Items'
  self._icon = 'fa fa-share-alt'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  if (!self.view) return
  self.view.layout.position()
  self.view.updatePosition()
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.view && self.view.isFocused()) self.enable()
  else self.disable()
}

module.exports = new Self
