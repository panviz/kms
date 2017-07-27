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
      select2Tag: '#tags',
      searchTag: '#searchTag',
    }
    const $html = $(G.Templates['ui/search/search']())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    this.elements.select2Tag.select2({
      minimumInputLength: 2,
      ajax: {
        url: "/select2",
        dataType: 'json',
        delay: 250,
        processResults: function (data) {
          return {
            results: data
          };
        },

        cache: true
      },
      tags: true,
      tokenSeparators: [',', ' '],
      placeholder: "Add your tags here"
    })
   // this.elements.input.on('keyup', this._onChange.bind(this))
   //this.elements.ignoreCase.on('click', this._onChange.bind(this))
    this.elements.searchTag.on('click', this._onSearch.bind(this))
  }

  _onSearch (e) {
    const values = _.map(this.elements.select2Tag.select2('data'), (obj) => {
      return obj.text
    })
    this.trigger('searchTag', {
      tags: values
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
