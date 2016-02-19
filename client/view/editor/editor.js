var View = require('../view')
, Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    text: 'textarea',
  }
  var $html = $(G.Templates['view/editor/editor']())
  if (self.p.hidden) $html.css("display", "none")
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)
}
Self.prototype = Object.create(View.prototype)

Self.prototype.set = function (value) {
  var self = this
  self.elements.text.val(value)
}

Self.prototype.isFocused = function (value) {
  var self = this
  self.elements.text.is(':focus')
}

module.exports = Self
