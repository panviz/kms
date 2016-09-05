import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'itemRemove'
    this._label = 'Delete'
    this._deny = true
    this._icon = 'fa fa-remove'
    this.class = 'attention'
    this.group = 'item'

    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.removeItem(keys)
  }

  evaluate (selection) {
    if (selection.getCount()) this.enable()
    else this.disable()
  }
}
