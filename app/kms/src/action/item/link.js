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
    else if (keys.length > 2) {
      const [target, ...linkKeys] = keys
      registrar.itemman.linkItems(target, linkKeys)
    } else if (args.length === 2) {
      registrar.itemman.linkItems(args[0], args[1])
    }
  }

  evaluate (registrar) {
    super.evaluate(registrar.currentView.selection.getCount() > 1)
  }
}