import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)
  this.id = 'itemSave'
  this._label = 'Save'
  this._deny = true
  this._icon = 'fa fa-save'
  this.group = 'item'

  this.registrar.ui.editor.on('change', this.evaluate.bind(this))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  const key = this.registrar.ui.editor.getKey()
  const value = this.registrar.ui.editor.get()
  this.registrar.saveItem(value, key)
}

Self.prototype.evaluate = function () {
  if (this.registrar.ui.editor && this.registrar.ui.editor.isChanged()) this.enable()
  else this.disable()
}
