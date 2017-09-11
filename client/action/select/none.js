import Action from '../action'

export default class SelectNone extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectNone'
    this._label = 'none'
    this._icon = 'fa fa-ban'
    this.group = 'select'
  }

  _execute () {
    this.registrar.currentView.selection.clear()
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
