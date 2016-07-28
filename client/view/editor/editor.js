import View from '../view'
import Util from '../../../core/util'

export default function Self (p = {}) {
  this.p = p
  this._item = {}
  this.selectors = {
    text: 'textarea',
  }
  const $html = $(G.Templates['view/editor/editor']())
  if (this.p.hidden) $html.css('display', 'none')
  this.p.container.append($html)
  this.elements = Util.findElements($html, this.selectors)
  this.elements.text.on('input', this._onChange.bind(this))
}
Self.prototype = Object.create(View.prototype)
/**
 * @param ID key of item to edit
 * @param String value of item
 */
Self.prototype.set = function (value, key) {
  this._item.key = key
  this._item.value = value
  this.elements.text.val(value)
}
/**
 * @return String value of item edited
 */
Self.prototype.get = function () {
  return this.elements.text.val()
}
/**
 * @return ID of currently edited item
 */
Self.prototype.getKey = function () {
  return this._item.key
}
/**
 * extend View.show method
 */
Self.prototype._show = Self.prototype.show
Self.prototype.show = function () {
  if (this._show()) this.elements.text.focus()
}
/**
 * override View.isFocused method
 */
Self.prototype.isFocused = function (value) {
  this.elements.text.is(':focus')
}
/**
 * @return Boolean whether initial value of item was changed
 */
Self.prototype.isChanged = function () {
  return this._item.value !== this.get()
}
/**
 * notifies editor that changed value is saved
 */
Self.prototype.saved = function () {
  this._item.value = this.get()
  this.trigger('change')
}

Self.prototype._onChange = function () {
  this.trigger('change', this.get())
}
