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

  evaluate (registrar) {
    const count = registrar.currentView.selection.getCount()
    let active = false
    if (count > 1) {
      const keys = registrar.currentView.selection.getAll()
      const key1 = keys.shift()
      _.each(keys, (key) => {
        const linkeds = registrar.currentView.graph.getLinked(key)
        _.each(linkeds, (linked) => {
          if (linked === key1) {
            active = true
            return false
          }
        })
        if (active) return false
      })
      super.evaluate(active)
    }


  }
}
