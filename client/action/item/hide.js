import Action from '../action'

export default class Hide extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemHide'
    this._label = 'Hide'
    this._icon = 'mdi mdi-eye-off'
    this.group = 'item'

    this.registrar.ui.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
  }

  _execute () {
    const keys = this.registrar.ui.graphView.selection.getAll()
    this.registrar.unlinkItems(this.registrar.serviceItem.visibleItem, keys)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
