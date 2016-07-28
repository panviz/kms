import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'itemUnlink'
  this._label = 'Unlink'
  this._icon = 'fa fa-unlink'
  this.group = 'item'
  this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  const keys = this.registrar.selection.getAll()
  this.registrar.unlinkItems(keys[0], keys[1])
}

Self.prototype.evaluate = function (selection) {
  if (selection.getCount() > 1) this.enable()
  else this.disable()
}
