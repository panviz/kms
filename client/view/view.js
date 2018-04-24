/**
 * Base object for views
 * @event focus fires on view gain focus
 */
import EventEmitter from 'eventemitter3'
import Collection from '@graphiy/collection'
import Util from '../../core/util'

export default class View extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
    this.selection = this.p.selection || new Collection()
    this.fixedNodes = this.p.fixedNodes || new Collection()
    this.transform = p.transform || false
    this.context = p.context || []
    this.depth = p.depth || 1
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
    this.emit('show')
    return true
  }

  hide () {
    if (!this.isVisible()) return
    this.elements.root.hide()
    this.emit('hide')
  }

  toggle () {
    this.elements.root.toggle()
  }

  toggleSize (e) {
    this.elements.size.toggleClass('max min mdi-window-maximize mdi-window-minimize')
    this.emit('toogleSize', e.target)
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
    this.$el.on(`${eventName}.delegateEvents`, selector, listener)
    return this
  }

  /**
   * Change the view's element (`this.el` property) and re-delegate the
   * view's events on the new element.
   * @param content
   * $root root element
   * @returns {View}
   */
  setElement (content, $root) {
    this.undelegateEvents()
    this._setElement(content, $root)
    this.delegateEvents()
    return this
  }

  _setElement (content, $root) {
    const $content = content instanceof $ ? content : $(content)
    if ($root === undefined) {
      this.$el = $content
      this.el = this.$el[0]
      this.p.container.append(this.$el)
    } else {
      $root.append($content)
    }
    this.elements = Util.findElements(this.$el, this.selectors)
  }

  delegateEvents (events = this.events) {
    if (!events) return this
    this.undelegateEvents()
    for (const key in events) {
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

  getSelectors () {
    return `v_${this.key}`
  }
}
