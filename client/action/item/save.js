import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)
  this.id = 'itemSave'
  this._label = 'Save'
  this._deny = true
  this._icon = 'fa fa-save'
  this.group = 'item'

  this.registrar.editor.on('change', this.evaluate.bind(this))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  const key = this.registrar.editor.getKey()
  const value = this.registrar.editor.get()
  this.registrar.saveItem(value, key)
}

Self.prototype.evaluate = function () {
  if (this.registrar.editor && this.registrar.editor.isChanged()) this.enable()
  else this.disable()
}
