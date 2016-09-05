import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'selectNone'
    this._label = 'none'
    this._icon = 'fa fa-ban'
    this.group = 'select'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    this.registrar.selection.clear()
  }

  evaluate (selection) {
    if (selection.getCount()) this.enable()
    else this.disable()
  }
}
