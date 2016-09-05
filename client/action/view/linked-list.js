import Action from '../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'showLinkedList'
    this._label = 'Linked Items List'
    this.group = 'item'
  }

  _execute () {
    this.registrar.ui.linkedList.toggle()
  }
}
