/**
 * List view
 * Items are represented with rows
 */
import View from '../view'
import Util from '../../../core/util'

export default function Self (p) {
  this.p = p || {}
  this.selectors = {
    list: '.items-list',
  }
  const $html = $(G.Templates['view/list/list']())
  this._rowTemplate = G.Templates['view/list/row']
  if (this.p.hidden) $html.css('display', 'none')
  this.p.container.append($html)
  this.elements = Util.findElements($html, this.selectors)

  this.elements.list.on('click', this._onRowClick.bind(this))
  this.p.selection.on('change', this._onSelectionChange.bind(this))
}
Self.prototype = Object.create(View.prototype)
/**
 * populate list with items
 */
Self.prototype.render = function (itemsMap) {
  const list = _.map(itemsMap, (value, key) => this._rowTemplate({ value, key })).join('')
  this.elements.list.html(list)
}
/**
 * Select row in click
 */
Self.prototype._onRowClick = function (e) {
  const $el = $(e.target)
  const key = $el.data('key')

  this.p.selection.clear()
  this.p.selection.add(key)
}
/**
 * Highlight selected row
 * @param Array selection keys
 */
Self.prototype._onSelectionChange = function (selection) {
  _.each(selection, (key) => {
    this.elements.list.find(`li[data-key="${key}"]`).toggleClass('selected')
  })
}
