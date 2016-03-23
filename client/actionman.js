/**
 * Action Manager
 */
export default function Self(p) {
  this.p = p || {}
  this._instances = {}
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.get = function (id) {
  return this._instances[id]
}

Self.prototype.getAll = function () {
  return this._instances
}

Self.prototype.getActive = function () {
  return _.filter(this._instances, (action, id) => {
    return action.isEnabled()
  })
}

Self.prototype.set = function (Action, registrar) {
  var action = new Action({registrar: registrar})
  this._instances[action.id] = action
  this.trigger('add', action)
}
/**
 * Updates all actions state
 */
Self.prototype.update = function (selection) {
  _.values(this._instances).forEach(action => {
    action.evaluate(selection)
  })
}
/**
* Fire an action based on its id
* @param actionName String The id of the action
*/
Self.prototype.fire = function (actionName) {
  var action = this._instances[actionName]

  if (action !== null) {
    var argsExceptFirst = Array.prototype.slice.call(arguments, 1)
    action.apply(argsExceptFirst)
  }
}
