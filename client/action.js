/** 
 * A "Command" object
 * @event show
 * @event hide
 * @event enable
 * @event disable
 */
var Self = function (p) {
  var self = this

  p = p || {}
  self.id = p.id
  self._label = p.label
  self._icon = p.icon || '/res/image/icon/Action.png'
}
BackboneEvents.mixin(Self.prototype)
/**
 * Execute the action code
 */
Self.prototype.apply = function () {
  var self = this
  if (self._deny) return

  if (self.execute) {
    self.execute.apply(self, arguments)
  }
}
// Override in ConcreteCommand
Self.prototype.execute = function () {
  var self = this
}
/**
 * Evaluate enabled state on selection change
 * @param selection Array
 */
Self.prototype.evaluate = function(selection) {
}
/**
 * @returns Boolean whether Action has undo method
 */
Self.prototype.canUndo = function () {
  var self = this
  return !!self._undo
}

Self.prototype.isEnabled = function () {
  var self = this
  return !self._deny
}
/**
 * Refresh icon image source
 * @param newSrc String The image source
 */
Self.prototype.setIcon = function (newSrc) {
  var self = this
}
/**
 * Refresh the action label
 * @param newLabel String the new label
 * @param newTitle String the new tooltip
 */
Self.prototype.setLabel = function (newLabel, newTitle) {
  var self = this
  self._label = newLabel
}

Self.prototype.getLabel = function () {
  var self = this
  return self._label
}
/**
 * Changes show/hide state
 * Notifies "hide" Event
 */
Self.prototype.hide = function () {
  var self = this
  self._deny = true
  self.trigger('hide')
}
/**
 * Changes show/hide state
 * Notifies "show" Event 
 */
Self.prototype.show = function () {
  var self = this
  self._deny = false
  self.trigger('show')
}
/**
 * Changes enable/disable state
 * Notifies "disable" Event 
 */
Self.prototype.disable = function () {
  var self = this
  if (self._deny) return
  self._deny = true
  self.trigger('disable')
}
/**
 * Changes enable/disable state
 * Notifies "enable" Event 
 */
Self.prototype.enable = function () {
  var self = this
  if (!self._deny) return
  self._deny = false
  self.trigger('enable')
}

module.exports = Self
