/**
 * Base object for views
 * @event focus fires on view gain focus
 */
export default class Self extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
  }

  show () {
    if (this.isVisible()) return false
    this.elements.root.show()
    this.trigger('show')
    return true
  }

  hide () {
    if (!this.isVisible()) return
    this.elements.root.hide()
    this.trigger('hide')
  }

  toggle () {
    this.elements.root.toggle()
  }

  isVisible () {
    return this.elements.root.is(':visible')
  }

  isFocused () {
    return this.elements.root.is(':focus')
  }
}
