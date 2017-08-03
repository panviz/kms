/**
 * Base object for layouts
 */
import EventEmitter from 'eventemitter3'

export default class Self extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
    this.width = p.width || 0
    this.height = p.height || 0
  }

  size (width, height) {
    this.width = width
    this.height = height
  }

  run () {
  }
}
