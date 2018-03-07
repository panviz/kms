import { Action } from '@graphiy/actionman'

export default class SelectChildren extends Action {
  constructor (p) {
    super(p)
    this._id = 'SelectChildren'
    this._deny = true
  }

  _execute (registrar, args) {
    const selected = registrar.currentView.selection.clear()
    _.each(selected, (item) => {
      registrar.currentView.selection.add(registrar.currentView.graph.getLinked(item))
    })
  }

  evaluate (registrar, selection) {
    const keyS = selection.getAll()
    let links = []
    _.find(keyS, (key) => {
      links = registrar.currentView.graph.getLinks(key)
      if (links.length > 0) return true
    })
    links.length ? super.evaluate(true) : super.evaluate(false)
  }
}
