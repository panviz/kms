import Action from '../action'

export default class Expand extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemShowChildren'
    this._label = 'Show Children'
    this._icon = 'mdi mdi-sitemap'
    this.group = 'item'

    this.registrar.ui.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
  }

  _execute (...args) {
    const keys = this.registrar.ui.graphView.selection.getAll()
    if (args[0].type === 'dblclick') this.registrar.showChildren(keys, true)
    else this.registrar.showChildren(keys, false)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
