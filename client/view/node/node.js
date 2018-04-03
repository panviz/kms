/**
 * Simple Node view
 */

import View from '../view'
import template from './node.html'
import './node.scss'

export default class Node extends View {
  constructor (p) {
    super(p)
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.value = p.value
    this.render(this.value)
  }

  get selectors () {
    return _.extend(super.selectors, {
      row: '.node',
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
      d3.selectAll('.circle')
        .style('width', this.p.node.size.width)
        .style('height', this.p.node.size.height)
    }
  }

  _update (value) {
    this.$el.innerHTML = value
  }

  remove () {
    this.$el.remove()
  }
}
