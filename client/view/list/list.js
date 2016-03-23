/**
 * List view
 * Items are represented with rows
 */
import View from '../view'
import Util from '../../../core/util'

export default function Self(p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    list: '.items-list',
  }
  var $html = $(G.Templates['view/list/list']())
  self._rowTemplate = G.Templates['view/list/row']
  if (self.p.hidden) $html.css('display', 'none')
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)

  self.elements.list.on('click', self._onRowClick.bind(self))
  self.p.selection.on('change', self._onSelectionChange.bind(self))
}
Self.prototype = Object.create(View.prototype)
/**
 * populate list with items
 */
Self.prototype.render = function (itemsMap) {
  var self = this
  var list = _.map(itemsMap, function (value, key) {
    return self._rowTemplate({value: value, key: key})
  }).join('')
  self.elements.list.html(list)
}
/**
 * Select row in click
 */
Self.prototype._onRowClick = function (e) {
  var self = this
  var $el = $(e.target)
  var key = $el.data('key')

  self.p.selection.clear()
  self.p.selection.add(key)
}
/**
 * Highlight selected row
 * @param Array selection keys
 */
Self.prototype._onSelectionChange = function (selection) {
  var self = this
  _.each(selection, function (key) {
    self.elements.list.find(`li[data-key="${key}"]`).toggleClass('selected')
  })
}
