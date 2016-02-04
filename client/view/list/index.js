/**
 * List view
 * Items are represented with rows
 */
var Utils = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    list: '.items-list',
  }
  var $html = $(G.Templates['view/list/list']())
  self.p.container.append($html)
  self.elements = Utils.findElements($html, self.selectors)

  self._links = []
  self._nodes = []

  self.elements.list.on('click', self._onRowClick.bind(self))
  self.p.selection.on('change', self._onSelectionChange.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.render = function (items) {
  var self = this
  var list = _.map(items, function (item) {
    return G.Templates['view/list/row'](item)
  }).join('')
  self.elements.list.html(list)
}

Self.prototype._onRowClick = function (e) {
  var self = this
  var $el = $(e.target)
  var key = $el.data('key')

  self.p.selection.clear()
  self.p.selection.add(key)
}
/**
 * @param Array selection items
 */
Self.prototype._onSelectionChange = function (selection) {
  var self = this
  _.each(selection, function (key) {
    self.elements.list.find('li[data-key="'+key+'"]').toggleClass('selected')
  })
}

module.exports = Self
