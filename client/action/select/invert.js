import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'selectInvert'
    this._label = 'Invert'
    this._icon = 'mdi mdi-invert-colors'
    this.group = 'select'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const selection = this.registrar.selection
    const unselect = selection.clear()
    const all = this.registrar.visibleItems.getAll()
    selection.add(_.difference(all, unselect))
  }

  evaluate (selection) {
    if (this.registrar.visibleItems.getCount()) this.enable()
    else this.disable()
  }
}
