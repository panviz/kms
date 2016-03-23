import Action from '../../../action'

export default function Self(p) {
  Action.call(this, p)
  var self = this
  self.id = 'graphFixItemPosition'
  self._label = 'Fix Item Position'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
}
