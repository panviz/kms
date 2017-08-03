/**
 * Search widget with autocomplete
 */
import EventEmitter from 'eventemitter3'
import Util from '../../../core/util'
import template from './search.html'

export default class Search extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p

    this.selectors = {
      input: 'input[type="text"]',
      ignoreCase: 'input[name="ignoreCase"]',
    }
    const $html = $(template())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    this.elements.input.on('keyup', this._onChange.bind(this))
    this.elements.ignoreCase.on('click', this._onChange.bind(this))
  }

  _onChange (e) {
    const value = e.target.value
    if (value.length < 3) return
    this.trigger('update', {
      str: value,
      flags: this.elements.ignoreCase.is(':checked') ? 'i' : '',
    })
  }
}
