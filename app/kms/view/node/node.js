/**
 * Simple Node view
 */
import Util from '@graphiy/util'
import View from '../view'
import template from './node.html'
import './node.scss'

export default class Node extends View {
  constructor (p) {
    super(p)
    this.$el = p.$el || undefined
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.value = p.value
    this.fix = false


    if (!this.transform) {
      this.$el = $('<div>')
      this.$el.addClass(`${this.selectors.hidden.slice(1)}`)
      this.render(this.value)
    } else {
      this.elements = Util.findElements(this.$el, this.selectors)
      this.startTransform()
    }
    this.$el.addClass(`view ${this.selectors.node.slice(1)} noselect`)
    this.$el.find('.circle')
      .width(this.p.node.size.width)
      .height(this.p.node.size.height)
  }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.node',
      text: '.text',
      hidden: '.hide',
    })
  }

  set fixed (value) {
    if (value) {
      this.fix = true
    } else {
      this.fix = false
      this._removePin()
    }
  }

  render (value) {
    if (!this.$el.is(':empty')) {
      this._update(value)
    } else {
      const $html = $(template({ value }))
      this.$el.append($html)
      if (this.p.hidden) $html.css('display', 'none')
      this.setElement(this.$el)
      if (this.fix) {
        this.addPin()
      }
    }
  }

  _update (value) {
    this.$el.innerHTML = value
  }

  startTransform () {
    this.elements.text.detach()
    this.$el.removeClass()
    this.$el.addClass(`${this.selectors.hidden.slice(1)}`)
    this.$el.empty()
  }

  endTransform () {
    $('<div>', { class: 'circle' })
      .width(this.p.node.size.width)
      .height(this.p.node.size.height)
      .appendTo(this.$el)
    this.elements.text.appendTo(this.$el)
    if (this.fix) {
      this.addPin()
    }
    this.$el.removeClass(`${this.selectors.hidden.slice(1)}`)
  }

  addPin () {
    this.$el.addClass('pin')
    const img = document.createElement('img')
    img.style.width = this.p.node.size.width / 2
    img.style.height = this.p.node.size.height / 2
    img.src = '/client/view/graph/pin.svg'
    this.$el.append(img)
  }

  _removePin () {
    d3.selectAll('.pin')
      .classed('pin', false)
      .select('img')
      .remove()
  }

  remove () {
    this.$el.addClass('hide')
    setTimeout(() => {
      this.$el.remove()
    }, 750)
  }
}
