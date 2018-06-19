import Action from '../action'

export default class Hide extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemHide'
    this._label = 'Hide'
    this._icon = 'mdi mdi-eye-off'
    this.group = 'item'
  }

  _execute () {
    const keys = this.registrar.currentView.selection.getAll()
    this.registrar.itemman.unlinkItems(this.registrar.itemman.serviceItem.visibleItem, keys)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
