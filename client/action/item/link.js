import Action from '../../action'

export default function Self(p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemLink'
  self._label = 'Link'
  self._icon = 'fa fa-link'
  self.group = 'item'
  self.registrar.selection.on('change', self.evaluate.bind(self, self.registrar.selection))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype._execute = function (target) {
  var self = this
  target = _.isString(target) ? target : undefined
  var keys = self.registrar.selection.getAll()
  if (target && keys.length > 0) self.registrar.linkItems(target, keys)
  else if (keys.length === 2) self.registrar.linkItems(keys[0], keys[1])
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (selection.getCount()) self.enable()
  else self.disable()
}
