import { Action } from '@graphiy/actionman'

export default class DeletePosition extends Action {
  constructor (p) {
    super(p)
    this._id = 'DeletePosition'
    this._deny = true
  }

  _execute (registrar, args) {
    const selection = registrar.currentView.selection.getAll()
    registrar.itemman.deleteCoords(selection, registrar.currentView.key)
    registrar.currentView.selection.clear()
  }

  evaluate (registrar, selection) {
    super.evaluate(registrar.currentView.selection.getCount())
  }
}
