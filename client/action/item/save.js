import Action from '../../action'

export default function Self(p) {
  Action.call(this, p)
  var self = this
  self.id = 'itemSave'
  self._label = 'Save'
  self._deny = true
  self._icon = 'fa fa-save'
  self.group = 'item'

  self.registrar.editor.on('change', self.evaluate.bind(self))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  var self = this
  var key = self.registrar.editor.getKey()
  var value = self.registrar.editor.get()
  self.registrar.saveItem(value, key)
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.registrar.editor && self.registrar.editor.isChanged()) self.enable()
  else self.disable()
}
