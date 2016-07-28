import Action from '../../../action'

export default function Self (p) {
  Action.call(this, p)
  this.id = 'grid'
  this._deny = false
  this._label = 'Grid'
  this._icon = 'fa fa-th'
  this.group = 'layout'

  this.registrar.on('show', this.enable.bind(this))
  this.registrar.on('hide', this.disable.bind(this))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  this.registrar.layout = this.registrar.layouts[this.id]
  this.registrar.updateLayout()
}

Self.prototype.evaluate = function () {
  if (this.registrar && this.registrar.isVisible()) this.enable()
  else this.disable()
}
