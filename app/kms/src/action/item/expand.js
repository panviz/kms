import { Action } from '@graphiy/actionman'

export default class Expand extends Action {
  constructor (p) {
    super(p)
    this._id = 'Expand'
    this._deny = true
  }

  _execute (registrar, args) {
    registrar.currentView.expand()
  }

  evaluate (registrar) {
    super.evaluate(registrar.currentView.selection.getCount())
  }
}
