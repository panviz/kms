/**
 * A "Command" object
 * @event enable
 * @event disable
 */
export default function Self (p = {}) {
  this.registrar = p.registrar
  this.id = p.id
  this._label = p.label
  this._icon = p.icon || 'fa fa-check-square-o'
  this._deny = true
}
BackboneEvents.mixin(Self.prototype)
/**
 * Execute the action code
 */
Self.prototype.apply = function (...args) {
  if (this._deny) return

  if (this._execute) {
    this._execute(args)
  }
}
/**
 * Override in Concrete Command
 */
Self.prototype._execute = function () {
}
/**
 * Evaluate enabled state on selection change
 * @param selection Array
 */
Self.prototype.evaluate = function (selection) {
}
/**
 * @returns Boolean whether Action has undo method
 */
Self.prototype.canUndo = function () {
  return !!this._undo
}

Self.prototype.isEnabled = function () {
  return !this._deny
}
/**
 * Change icon
 * @param String cssClass
 */
Self.prototype.setIcon = function (cssClass) {
  this._icon = cssClass
}
Self.prototype.getIcon = function () {
  return this._icon
}
/**
 * Refresh the action label
 * @param newLabel String the new label
 * @param newTitle String the new tooltip
 */
Self.prototype.setLabel = function (newLabel, newTitle) {
  this._label = newLabel
}

Self.prototype.getLabel = function () {
  return this._label
}
/**
 * Changes enable/disable state
 * Notifies "disable" Event
 */
Self.prototype.disable = function () {
  if (this._deny) return
  this._deny = true
  this.trigger('disable')
}
/**
 * Changes enable/disable state
 * Notifies "enable" Event
 */
Self.prototype.enable = function () {
  if (!this._deny) return
  this._deny = false
  this.trigger('enable')
}
