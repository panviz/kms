/**
 * Simple Row view
 */

import View from '../view'
import Util from '../../../core/util'
import template from './row.html'
import './row.scss'

export default class Row extends View {
  constructor (p) {
    super(p)
    this.$el = p.$el || undefined
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.value = p.value

    if (!this.transform) {
      this.$el = $('<div>')
      this.render(this.value)
    } else {
      this.elements = Util.findElements(this.$el, this.selectors)
      this.elements.text.detach()
      this.$el.removeClass()
      this.$el.empty()
      this.elements.text.appendTo(this.$el)
    }
    this.$el.addClass(`view ${this.selectors.node.slice(1)} noselect`)
  }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.row',
      text: '.text',
    })
  }

  render (value) {
    if (!this.$el.is(':empty')) {
      this._update(value)
    } else {
      const $html = $(template({ value }))
      this.$el.append($html)
      if (this.p.hidden) $html.css('display', 'none')
      this.setElement(this.$el)
    }
  }

  _update (value) {
    this.$el.innerHTML = value
  }

  remove () {
    this.$el.remove()
  }
}
