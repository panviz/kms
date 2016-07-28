import Action from '../action'

export default function Self (p) {
  Action.call(this, p)

  this.id = 'showLinkedList'
  this._label = 'Linked Items List'
  this.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function () {
  this.registrar.linkedList.toggle()
}
