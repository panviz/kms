/**
 * Actions Manager
 */
var actions = {
  graphAutoLayout: require('./view/graph/action/autoLayout'),
  itemCreate: require('./action/item/create'),
  itemEdit: require('./action/item/edit'),
  itemShowChildren: require('./action/item/showChildren'),
  itemHide: require('./action/item/hide'),

}
var Self = function (p) {
  var self = this;
  self.p = p || {}
  self._instances = {}
  self.selection = self.p.selection

  _.map(actions, function (Action, id) {
    self._instances[id] = new Action
  })

  self.selection.on('change', self.update)
}
/**
 * Updates all actions according with current selection
 */
Self.prototype.update = function (ids) {
  var self = this
  _.values(self._instances).forEach(function (action) {
    action.evaluate(ids)
  })
}

Self.prototype.get = function (id) {
  var self = this
  return self._instances[id]
}
Self.prototype.getAll = function () {
  var self = this
  return self._instances
}

Self.prototype.getActive = function () {
  var self = this
  return _.filter(self._instances, function (action, id) {
    return action.isEnabled()
  })
}

Self.prototype.set = function (id, action) {
  var self = this
  return self._instances[id] = action
}
/**
* Fire an action based on its id
* @param actionName String The id of the action
*/
Self.prototype.fire = function (actionName) {
  var self = this
  var action = self._instances[actionName]
  
  if (action != null) {
    var argsExceptFirst = Array.prototype.slice.call(arguments, 1)
    action.apply.apply(self, argsExceptFirst)
    self.selection.clear()
  }
}

module.exports = Self
