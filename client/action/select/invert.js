import Action from '../action'

export default class Invert extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectInvert'
    this._label = 'Invert'
    this._icon = 'mdi mdi-invert-colors'
    this.group = 'select'

    this.registrar.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.graphView.selection))
  }

  _execute () {
    const selection = this.registrar.graphView.selection
    const unselect = selection.clear()
    const all = this.registrar.itemman.graph.getItemKeys()
    selection.add(_.difference(all, unselect))
  }

  evaluate (selection) {
    const itemsCount = this.registrar.itemman.graph.getCount()
    const selectionCount = selection.getCount()
    if (selectionCount > 0) {
      itemsCount - selectionCount > 0 ? super._evaluate(true) : super._evaluate(false)
    } else super._evaluate(false)
  }
}
