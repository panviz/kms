var Action = require('../../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self._deny = false
  self.group = 'layout'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function (p) {
  var self = this
  var id = p.id || 'force'
  self.view.layout = self.view.layouts[id]
  self.view.updatePosition()
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.view && self.view.isFocused()) self.enable()
  else self.disable()
}


module.exports = Self
