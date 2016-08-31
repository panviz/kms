import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)

    this.id = 'itemShowChildren'
    this._label = 'Show Children'
    this._icon = 'fa fa-plus-circle'
    this.group = 'item'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.showChildren(keys)
  }

  evaluate (selection) {
    if (selection.getCount()) this.enable()
    else this.disable()
  }
}
