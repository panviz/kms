import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'itemShowChildren'
  this._label = 'Show Children'
  this._icon = 'fa fa-plus-circle'
  this.group = 'item'
  this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  const keys = this.registrar.selection.getAll()
  this.registrar.showChildren(keys)
}

Self.prototype.evaluate = function (selection) {
  if (selection.getCount()) this.enable()
  else this.disable()
}
