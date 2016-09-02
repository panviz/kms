import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'itemCreate'
    this._label = 'Create'
    this._icon = 'fa fa-square-o'
    this.group = 'item'
    this._deny = false
  }

  _execute () {
    this.registrar.createItem()
  }
}
