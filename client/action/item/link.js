import Action from '../../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'itemLink'
  this._label = 'Link'
  this._icon = 'fa fa-link'
  this.group = 'item'
  this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function (_target) {
  const target = _.isString(_target) ? _target : undefined
  const keys = this.registrar.selection.getAll()
  if (target && keys.length > 0) this.registrar.linkItems(target, keys)
  else if (keys.length === 2) this.registrar.linkItems(keys[0], keys[1])
}

Self.prototype.evaluate = function (selection) {
  if (selection.getCount()) this.enable()
  else this.disable()
}
