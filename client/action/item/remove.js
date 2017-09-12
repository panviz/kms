import Action from '../action'

export default class Remove extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemRemove'
    this._label = 'Delete'
    this._icon = 'fa fa-remove'
    this._type = 'attention'
    this.group = 'item'
  }

  _execute () {
    const keys = this.registrar.currentView.selection.getAll()
    this.registrar.itemman.removeItem(keys)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
