import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectNone'
    this._label = 'none'
    this._icon = 'fa fa-ban'
    this.group = 'select'

    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    this.registrar.selection.clear()
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
