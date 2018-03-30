/**
 * Simple Row view
 */

import View from '../view'
import template from './row.html'
import './row.scss'

export default class Row extends View {
  constructor (p) {
    super(p)
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.value = p.value
    this.render(this.value)
  }

  get selectors () {
    return _.extend(super.selectors, {
      row: '.row',
    })
  }

  render (value) {
    if (this.$el) {
      this._update(value)
    } else {
      const $html = $(template({ value }))
      if (this.p.hidden) $html.css('display', 'none')
      this.setElement($html)
      this.$el = $html
    }
  }

  _update (value) {
    this.$el.innerHTML = value
  }

  remove () {
    this.$el.remove()
  }
}
