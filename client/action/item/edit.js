import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'itemEdit'
  this._label = 'Edit'
  this._icon = 'fa fa-pencil-square-o'
  this.group = 'item'
  this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  this.registrar.ui.editor.on('show', this.evaluate.bind(this, this.registrar.selection))
  this.registrar.ui.editor.on('hide', this.evaluate.bind(this, this.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  const keys = this.registrar.selection.getAll()
  this.registrar.editItem(keys[0])
}

Self.prototype.evaluate = function (selection) {
  if (selection.getCount() && !this.registrar.ui.editor.isVisible()) this.enable()
  else this.disable()
}
