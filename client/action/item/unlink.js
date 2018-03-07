import { Action } from '@graphiy/actionman'

export default class Unlink extends Action {
  constructor (p) {
    super(p)
    this._id = 'Unlink'
    this._deny = true
  }

  _execute (registrar, args) {
    const keys = registrar.currentView.selection.getAll()
    const key1 = keys.shift()
    registrar.itemman.unlinkItems(key1, keys)
  }

  evaluate (registrar, selection) {
    super.evaluate(selection.getCount() > 1)
  }
}
