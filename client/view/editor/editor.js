var View = require('../view')
, Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self._item = {}
  self.selectors = {
    text: 'textarea',
  }
  var $html = $(G.Templates['view/editor/editor']())
  if (self.p.hidden) $html.css("display", "none")
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)
  self.elements.text.on('input', self._onChange.bind(self))
}
Self.prototype = Object.create(View.prototype)
/**
 * @param ID key of item to edit
 * @param String value of item
 */
Self.prototype.set = function (value, key) {
  var self = this
  self._item.key = key
  self._item.value = value
  self.elements.text.val(value)
}
/**
 * @return String value of item edited
 */
Self.prototype.get = function () {
  var self = this
  return self.elements.text.val()
}
/**
 * @return ID of currently edited item
 */
Self.prototype.getKey = function () {
  var self = this
  return self._item.key
}
/**
 * extend View.show method
 */
Self.prototype._show = Self.prototype.show
Self.prototype.show = function () {
  var self = this
  if (self._show()) self.elements.text.focus()
}
/**
 * override View.isFocused method
 */
Self.prototype.isFocused = function (value) {
  var self = this
  self.elements.text.is(':focus')
}
/**
 * @return Boolean whether initial value of item was changed
 */
Self.prototype.isChanged = function () {
  var self = this
  return self._item.value !== self.get()
}
/**
 * notifies editor that changed value is saved
 */
Self.prototype.saved = function () {
  var self = this
  self._item.value = self.get()
  self.trigger('change')
}

Self.prototype._onChange = function () {
  var self = this
  self.trigger('change', self.get())
}

module.exports = Self
