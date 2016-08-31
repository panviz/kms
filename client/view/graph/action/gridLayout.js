import Action from '../../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'grid'
    this._deny = false
    this._label = 'Grid'
    this._icon = 'fa fa-th'
    this.group = 'layout'

    this.registrar.on('show', this.enable.bind(this))
    this.registrar.on('hide', this.disable.bind(this))
  }

  _execute () {
    this.registrar.layout = this.registrar.layouts[this.id]
    this.registrar.updateLayout()
  }

  evaluate () {
    if (this.registrar && this.registrar.isVisible()) this.enable()
    else this.disable()
  }
}
