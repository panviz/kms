import { Action } from '@graphiy/actionman'

export default class Link extends Action {
  constructor (p) {
    super(p)
    this._id = 'Link'
    this._deny = true
  }

  _execute (registrar, args) {
    const keys = registrar.currentView.selection.getAll()
    if (keys.length === 2) registrar.itemman.linkItems(keys[0], keys[1])
  }

  evaluate (registrar, selection) {
    super.evaluate(selection.getCount() === 2)
  }
}
