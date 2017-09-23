/**
 * A "Command" object
 * @event enable
 * @event disable
 */
import EventEmitter from 'eventemitter3'

export default class Action extends EventEmitter {
  constructor (p = {}) {
    super()
    this.registrar = p.registrar
    this._id = p.id
    this._label = p.label
    this._icon = p.icon || 'fa fa-check-square-o'
    this._deny = true
  }
  /**
   * Execute the action code
   */
  apply (...args) {
    if (this._deny) return undefined

    if (this._execute) {
      return this._execute(...args)
    }
    return undefined
  }
  /**
   * Override in Concrete Command
   */
  _execute () {
  }
  /**
   * Evaluate enabled state on selection change
   * @param selection Array
   */
  evaluate (selection) {
  }
  /**
   * Toggle enabled state
   */
  _evaluate (enable) {
    enable ? this.enable() : this.disable()
  }
  /**
   * Id getter prevents id from change
   */
  get id () {
    return this._id
  }
  /**
   * Change icon
   * @param String cssClass
   */
  set icon (cssClass) {
    this._icon = cssClass
  }
  get icon () {
    return this._icon
  }
  /**
   * Refresh the action label
   * @param newLabel String the new label
   */
  set label (newLabel) {
    this._label = newLabel
  }

  get label () {
    return this._label
  }

  get type () {
    return this._type
  }
  /**
   * Changes enable/disable state
   * Notifies "disable" Event
   */
  disable () {
    if (this._deny) return
    this._deny = true
    this.emit('disable')
  }
  /**
   * Changes enable/disable state
   * Notifies "enable" Event
   */
  enable () {
    if (!this._deny) return
    this._deny = false
    this.emit('enable')
  }
  /**
   * @returns Boolean whether Action has undo method
   */
  canUndo () {
    return !!this._undo
  }

  isEnabled () {
    return !this._deny
  }
}
