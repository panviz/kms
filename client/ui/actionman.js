/**
 * Action Manager
 */
import EventEmitter from 'eventemitter3'

export default class Actionman extends EventEmitter {
  constructor (p = {}) {
    super()
    this._instances = {}
  }

  get (id) {
    return this._instances[id]
  }

  getAll () {
    return this._instances
  }

  getActive () {
    return _.filter(this._instances, action => action.isEnabled())
  }

  set (Action, registrar, itemman) {
    const action = new Action({ registrar, itemman })
    this._instances[action.id] = action
    this.emit('add', action)
  }
  /**
   * Updates all actions state
   */
  update (selection) {
    _.values(this._instances).forEach(action => {
      action.evaluate(selection)
    })
  }
  /**
  * Fire an action based on its id
  * @param actionName String The id of the action
  */
  fire (actionName, ...args) {
    const action = this._instances[actionName]

    if (action !== null) {
      action.apply(args)
    }
  }
}
