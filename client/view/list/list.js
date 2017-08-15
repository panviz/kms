/**
 * List view
 * Items are represented with rows
 */
import View from '../view'
import template from './list.html'
import rowTemplate from './row.html'
import './list.scss'

export default class List extends View {
  constructor (p) {
    super(p)
    const $html = $(template())
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
    this.p.selection.on('change', this._onSelectionChange.bind(this))
  }

  get selectors () {
    return _.extend(super.selectors, {
      list: '.items-list',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click list': this._onRowClick,
    })
  }

  /**
   * populate list with items
   */
  render (itemsMap) {
    const list = _.map(itemsMap, (value, key) => rowTemplate({ value, key })).join('')
    this.elements.list.html(list)
  }

  /**
   * Select row in click
   */
  _onRowClick (e) {
    const $el = $(e.target)
    const key = $el.data('key')

    this.p.selection.clear()
    this.p.selection.add(key)
  }

  /**
   * Highlight selected row
   * @param Array selection keys
   */
  _onSelectionChange (selection) {
    _.each(selection, (key) => {
      this.elements.list.find(`li[data-key="${key}"]`).toggleClass('selected')
    })
  }
}
