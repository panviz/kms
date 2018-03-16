import { Action } from '@graphiy/actionman'

export default class Invert extends Action {
  constructor (p) {
    super(p)
    this._id = 'Invert'
    this._deny = true
  }

  _execute (registrar, args) {
    const selection = registrar.currentView.selection
    const unselect = selection.clear()
    const all = registrar.currentView.graph.getItemKeys()
    selection.add(_.difference(all, unselect))
  }

  evaluate (registrar) {
    const itemsCount = registrar.currentView.graph.getCount()
    const selectionCount = registrar.currentView.selection.getCount()
    if (selectionCount > 0) {
      itemsCount - selectionCount > 0 ? super.evaluate(true) : super.evaluate(false)
    } else super.evaluate(false)
  }
}
