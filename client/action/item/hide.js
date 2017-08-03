import Action from '../../action'

export default class Hide extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemHide'
    this._label = 'Hide'
    this._icon = 'mdi mdi-eye-off'
    this.group = 'item'

    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.visibleItems.remove(keys)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount())
  }
}
