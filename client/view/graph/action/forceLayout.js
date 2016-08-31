import Action from '../../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'force'
    this._label = 'Graph'
    this._deny = false
    this._icon = 'fa fa-share-alt'
    this.group = 'layout'

    this.registrar.on('show', this.enable.bind(this))
    this.registrar.on('hide', this.disable.bind(this))
  }

  _execute () {
    this.registrar.layout = this.registrar.layouts[this.id]
    this.registrar.updateLayout({ transit: false })
  }

  evaluate () {
    if (this.registrar && this.registrar.isVisible()) this.enable()
    else this.disable()
  }
}
