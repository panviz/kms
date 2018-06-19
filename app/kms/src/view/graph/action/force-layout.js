import Action from '../../../action/action'

export default class Force extends Action {
  constructor (p) {
    super(p)
    this._id = 'force'
    this._label = 'Graph'
    this._icon = 'fa fa-share-alt'
    this.group = 'layout'
    this._deny = false

    this.registrar.on('show', this.enable.bind(this))
    this.registrar.on('hide', this.disable.bind(this))
  }

  _execute () {
    this.registrar.layout = this.registrar.layouts[this.id]
    this.registrar.updateLayout({ transit: false })
  }

  evaluate () {
    super._evaluate(this.registrar && this.registrar.isVisible())
  }
}
