import View from '../view'
import Util from '../../../core/util'
import template from './editor.html'
import './editor.scss'

export default class Editor extends View {
  constructor (p) {
    super(p)
    this._item = {}
    const $html = $(template())
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
  }
  get selectors () {
    return _.extend(super.selectors, {
      text: 'textarea',
    })
  }

  get events () {
    return _.extend(super.events, {
      'input text': this._onChange,
    })
  }
  /**
   * @param ID key of item to edit
   * @param String value of item
   */
  set (value, key) {
    this._item.key = key
    this._item.value = value
    this.elements.text.val(value)
  }
  /**
   * @return String value of item edited
   */
  get () {
    return this.elements.text.val()
  }
  /**
   * @return ID of currently edited item
   */
  getKey () {
    return this._item.key
  }
  /**
   * extend View.show method
   */
  show () {
    if (super.show()) this.elements.text.focus()
  }
  /**
   * override View.isFocused method
   */
  isFocused (value) {
    this.elements.text.is(':focus')
  }
  /**
   * @return Boolean whether initial value of item was changed
   */
  isChanged () {
    return this._item.value !== this.get()
  }
  /**
   * notifies editor that changed value is saved
   */
  saved () {
    this._item.value = this.get()
    this.emit('change')
  }

  _onChange () {
    this.emit('change', this.get())
  }
}
