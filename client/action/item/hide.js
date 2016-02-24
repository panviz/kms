var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemHide'
  self._label = 'Hide'
  self._icon = 'fa fa-eye-slash'
  self.group = 'item'
  self.registrar.selection.on('change', self.evaluate.bind(self, self.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  var self = this
  var keys = self.registrar.selection.getAll()
  self.registrar.visibleItems.remove(keys)
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (selection.getCount()) self.enable()
  else self.disable()
}

module.exports = Self
