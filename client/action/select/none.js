import Action from '../action'

export default class SelectNone extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectNone'
    this._label = 'none'
    this._icon = 'fa fa-ban'
    this.group = 'select'

    this.registrar.ui.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
  }

  _execute () {
    this.registrar.ui.graphView.selection.clear()
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
