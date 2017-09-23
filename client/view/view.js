/**
 * Base object for views
 * @event focus fires on view gain focus
 */
import EventEmitter from 'eventemitter3'
import Collection from 'collection'
import Util from '../../core/util'

export default class View extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
    this.selection = new Collection()
  }

  get selectors () {
    return {
      title: '.title',
      close: '.close',
      size: '.size',
    }
  }

  get events () {
    return {
      'click close': this.hide,
      'click size': this.toggleSize,
    }
  }

  get _delegateEventSplitter () { return /^(\S+)\s*(.*)$/ }

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

  toggleSize (e) {
    this.elements.size.toggleClass('max min mdi-window-maximize mdi-window-minimize')
    this.trigger('toogleSize', e.target)
  }

  isVisible () {
    return this.elements.root.is(':visible')
  }

  isFocused () {
    return this.elements.root.is(':focus')
  }

  setTitle (title) {
    this.title = title
    this.elements.title.text(this.title)
    this.elements.title.show()
  }

  _delegate (eventName, selector, listener) {
    this.$el.on(eventName + '.delegateEvents', selector, listener)
    return this
  }

  /**
   * Change the view's element (`this.el` property) and re-delegate the
   * view's events on the new element.
   * @param element
   * @returns {View}
   */
  setElement (element) {
    this.undelegateEvents()
    this._setElement(element)
    this.delegateEvents()
    return this
  }

  _setElement (el) {
    this.$el = el instanceof $ ? el : $(el)
    this.el = this.$el[0]
    this.elements = Util.findElements(el, this.selectors)
    this.p.container.append(this.$el)
  }

  delegateEvents (events = this.events) {
    if (!events) return this
    this.undelegateEvents()
    for(let key in events) {
      let method = events[key]
      if (!_.isFunction(method)) method = this[method]
      if (!method) continue
      const [, eventName, selectorName] = key.match(this._delegateEventSplitter)


      this._delegate(eventName, this.selectors[selectorName], _.bind(method, this))
    }
    return this
  }
  /**
   * Clears all callbacks previously bound to the view by `delegateEvents`
   */

  undelegateEvents () {
    if (this.$el) this.$el.off('.delegateEvents')
    return this
  }
}
