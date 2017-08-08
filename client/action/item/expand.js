import Action from '../../action'

export default class Expand extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemShowChildren'
    this._label = 'Show Children'
    this._icon = 'mdi mdi-sitemap'
    this.group = 'item'

    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.showChildren(keys, this.label)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
