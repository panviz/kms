import { Action } from '@graphiy/actionman'

export default class Expand extends Action {
  constructor (p) {
    super(p)
    this._id = 'Expand'
    this._deny = true
  }

  _execute (registrar, args) {
    const keys = registrar.currentView.selection.getAll()
    registrar.currentView.selection.clear()
    registrar.currentView.context = keys[0]
    registrar.currentView.depth = 1
    registrar.currentView.emit('context:change', registrar.currentView.key)
    registrar.currentView.elements.context.empty().append(keys[0])

    registrar.itemman.showChildren(registrar.currentView.key)
  }

  evaluate (registrar) {
    super.evaluate(registrar.currentView.selection.getCount())
  }
}
