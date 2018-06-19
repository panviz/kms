import Action from '../action'

export default class LinkedList extends Action {
  constructor (p) {
    super(p)
    this._id = 'showLinkedList'
    this._label = 'Linked Items List'
    this.group = 'item'
  }

  _execute () {
    this.registrar.linkedList.toggle()
  }
}
