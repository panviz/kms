/**
 * Search widget with autocomplete
 */
var Utils = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}

  self.selectors = {
    input: 'input',
    ignoreCase: 'input[name="ignoreCase"]',
  }
  var $html = $(G.Templates['ui/search/search']())
  self.p.container.append($html)
  self.elements = Utils.findElements($html, self.selectors)

  self.elements.input.on('keyup', self._onChange.bind(self))
  self.elements.ignoreCase.on('click', self._onChange.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype._onChange = function (e) {
  var self = this
  var value = e.target.value
  if (value.length < 3) return 
  var regExp = new RegExp(value, self.elements.ignoreCase.is(':checked') ? 'i' : '')
  self.trigger('update', regExp)
}

module.exports = Self
