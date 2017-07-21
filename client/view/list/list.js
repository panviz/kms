/**
 * List view
 * Items are represented with rows
 */
import View from '../view'
import Util from '../../../core/util'

export default class Self extends View {
  constructor (p) {
    super(p)
    this.selectors = {
      list: '.items-list',
      title: '.title',
    }
    const $html = $(G.Templates['view/list/list']())
    this._rowTemplate = G.Templates['view/list/row']
    if (this.p.hidden) $html.css('display', 'none')
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    this.elements.list.on('click', this._onRowClick.bind(this))
    this.p.selection.on('change', this._onSelectionChange.bind(this))
  }
  /**
   * populate list with items
   */
  render (itemsMap) {
    const list = _.map(itemsMap, (value, key) => this._rowTemplate({ value, key })).join('')
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

  setTitle (title) {
    this.title = title
    this._showTitle()
  }

  _showTitle() {
    this.elements.title.text(this.title)
    this.elements.title.show()
  }
}
