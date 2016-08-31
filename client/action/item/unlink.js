import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'itemUnlink'
    this._label = 'Unlink'
    this._icon = 'fa fa-unlink'
    this.group = 'item'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.unlinkItems(keys[0], keys[1])
  }

  evaluate (selection) {
    if (selection.getCount() > 1) this.enable()
    else this.disable()
  }
}
