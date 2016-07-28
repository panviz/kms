/**
 * Search widget with autocomplete
 */
import Util from '../../../core/util'

export default function Self (p) {
  this.p = p || {}

  this.selectors = {
    input: 'input[type="text"]',
    ignoreCase: 'input[name="ignoreCase"]',
  }
  const $html = $(G.Templates['ui/search/search']())
  this.p.container.append($html)
  this.elements = Util.findElements($html, this.selectors)

  this.elements.input.on('keyup', this._onChange.bind(this))
  this.elements.ignoreCase.on('click', this._onChange.bind(this))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype._onChange = function (e) {
  const value = e.target.value
  if (value.length < 3) return
  this.trigger('update', {
    str: value,
    flags: this.elements.ignoreCase.is(':checked') ? 'i' : '',
  })
}
