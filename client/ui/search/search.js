/**
 * Search widget with autocomplete
 */
import Util from '../../../core/util'
import select2 from '../../../node_modules/select2/dist/js/select2'


export default class Self extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p

    this.selectors = {
      //input: 'input[type="text"]',
      //ignoreCase: 'input[name="ignoreCase"]',
      select2: '#tags',
      search: '#search',
    }
    const $html = $(G.Templates['ui/search/search']())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    this.elements.select2.select2({
      data: this.p.tags.getAll(),
      tags: true,
      tokenSeparators: [',', ' '],
      placeholder: "Add your tags here"
    })
   // this.elements.input.on('keyup', this._onChange.bind(this))
   //this.elements.ignoreCase.on('click', this._onChange.bind(this))
    this.elements.search.on('click', this._onSearch.bind(this))
  }

  _onSearch (e) {
    const value = this.elements.select2.val()
    this.trigger('searchTag', {
      tags: value
    })
  }
  /*_onChange (e) {
    const value = e.target.value
    if (value.length < 3) return
    this.trigger('update', {
      str: value,
      flags: this.elements.ignoreCase.is(':checked') ? 'i' : '',
    })
  }*/
}
