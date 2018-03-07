import { Action } from '@graphiy/actionman'

export default class Remove extends Action {
  constructor (p) {
    super(p)
    this._id = 'Remove'
    this._deny = true
  }

  _execute (registrar, args) {
    const keys = registrar.currentView.selection.getAll()
    registrar.currentView.selection.clear()
    registrar.itemman.removeItem(keys)
  }

  evaluate (registrar, selection) {
    super.evaluate(selection.getCount())
  }
}
