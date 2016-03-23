import Action from '../../action'

export default function Self(p) {
  Action.call(this, p)
  var self = this
  self.id = 'itemRemove'
  self._label = 'Delete'
  self._deny = true
  self._icon = 'fa fa-remove'
  self.group = 'item'

  self.registrar.selection.on('change', self.evaluate.bind(self, self.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  var self = this
  var keys = self.registrar.selection.getAll()
  self.registrar.removeItem(keys)
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (selection.getCount()) self.enable()
  else self.disable()
}
