import Action from '../action'

export default class Expand extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemShowChildren'
    this._label = 'Show Children'
    this._icon = 'mdi mdi-sitemap'
    this.group = 'item'
  }

  _execute (...args) {
    const keys = this.registrar.currentView.selection.getAll()
    if (args[0].type === 'dblclick') this.registrar.itemman.showChildren(keys, true)
    else this.registrar.itemman.showChildren(keys, false)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
