/**
 * Actions Manager
 */
var Self = function (p) {
  var self = this;
  self.p = p || {}
  self._instances = {}
}
BackboneEvents.mixin(Self.prototype)

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

Self.prototype.set = function (action) {
  var self = this
  self._instances[action.id] = action
  self.trigger('add', action)
}
/**
 * Updates all actions state
 */
Self.prototype.update = function (selection) {
  var self = this
  _.values(self._instances).forEach(function (action) {
    action.evaluate(selection)
  })
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
  }
}

module.exports = Self
