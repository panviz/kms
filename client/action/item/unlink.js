var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemUnlink'
  self._label = 'Unlink'
  self._icon = 'fa fa-unlink'
  self.group = 'item'
  self.registrar.selection.on('change', self.evaluate.bind(self, self.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  var self = this
  var keys = self.registrar.selection.getAll()
  self.registrar.unlinkItems(keys[0], keys[1])
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (selection.getCount() > 1) self.enable()
  else self.disable()
}

module.exports = Self
