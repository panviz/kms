import { Action } from '@graphiy/actionman'

export default class SelectNone extends Action {
  constructor (p) {
    super(p)
    this._id = 'SelectNone'
    this._deny = true
  }

  _execute (registrar, args) {
    registrar.currentView.selection.clear()
  }

  evaluate (registrar, selection) {
    super.evaluate(selection.getCount())
  }
}
