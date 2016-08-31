/**
 * A "Command" object
 * @event enable
 * @event disable
 */
export default class Self extends EventEmitter {
  constructor (p = {}) {
    super()
    this.registrar = p.registrar
    this.id = p.id
    this._label = p.label
    this._icon = p.icon || 'fa fa-check-square-o'
    this._deny = true
  }
  /**
   * Execute the action code
   */
  apply (...args) {
    if (this._deny) return

    if (this._execute) {
      this._execute(args)
    }
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
   * @returns Boolean whether Action has undo method
   */
  canUndo () {
    return !!this._undo
  }

  isEnabled () {
    return !this._deny
  }
  /**
   * Change icon
   * @param String cssClass
   */
  setIcon (cssClass) {
    this._icon = cssClass
  }
  getIcon () {
    return this._icon
  }
  /**
   * Refresh the action label
   * @param newLabel String the new label
   * @param newTitle String the new tooltip
   */
  setLabel (newLabel, newTitle) {
    this._label = newLabel
  }

  getLabel () {
    return this._label
  }
  /**
   * Changes enable/disable state
   * Notifies "disable" Event
   */
  disable () {
    if (this._deny) return
    this._deny = true
    this.trigger('disable')
  }
  /**
   * Changes enable/disable state
   * Notifies "enable" Event
   */
  enable () {
    if (!this._deny) return
    this._deny = false
    this.trigger('enable')
  }
}
