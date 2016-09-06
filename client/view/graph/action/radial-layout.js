import Action from '../../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this._id = 'radial'
    this._label = 'Radial'
    this._icon = 'fa fa-circle-o'
    this.group = 'layout'
    this._deny = false

    this.registrar.on('show', this.enable.bind(this))
    this.registrar.on('hide', this.disable.bind(this))
  }

  _execute () {
    this.registrar.layout = this.registrar.layouts[this.id]
    this.registrar.updateLayout()
  }

  evaluate () {
    super._evaluate(this.registrar && this.registrar.isVisible())
  }
}
