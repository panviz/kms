import Action from '../action'

export default class Remove extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemRemove'
    this._label = 'Delete'
    this._icon = 'fa fa-remove'
    this._type = 'attention'
    this.group = 'item'

    this.registrar.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.graphView.selection))
  }

  _execute () {
    const keys = this.registrar.graphView.selection.getAll()
    this.registrar.removeItem(keys)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
