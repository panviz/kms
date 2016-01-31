/**
 * List view
 * Items are represented with rows
 */
var Utils = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    list: '.items-list'
  }
  var $html = $(G.Templates['view/list/list']())
  self.p.container.append($html)
  self.elements = Utils.findElements($html, self.selectors)

  self._links = []
  self._nodes = []

  self.elements.list.on('click', self._onSelect.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.render = function (items) {
  var self = this
  var list = _.map(items, function (item) {
    return G.Templates['view/list/row'](item)
  }).join()
  self.elements.list.html(list)
}

Self.prototype._onSelect = function (e) {
  var self = this
  var $el = $(e.target)
  var key = $el.data('key')
  $el.addClass('selected')

  self.p.selection.add(key)
}

module.exports = Self
