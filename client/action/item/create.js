import { Action } from '@graphiy/actionman'

export default class Create extends Action {
  constructor (p) {
    super(p)
    this._id = 'Create'
    this._deny = false
  }

  _execute (registrar, args) {
    const selected = registrar.currentView.selection.clear()
    registrar.itemman.createItem(args.sub, selected)
  }


}
