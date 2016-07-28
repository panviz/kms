import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'itemCreate'
  this._label = 'Create'
  this._deny = false
  this._icon = 'fa fa-square-o'
  this.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  this.registrar.createItem()
}
