import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'itemHide'
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
    if (selection.getCount()) this.enable()
    else this.disable()
  }
}
