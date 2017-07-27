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
      select2Value: '#value',
      searchButton: '#searchButton',
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
    this.elements.select2Value.select2({
      tags: true,
      tokenSeparators: [',', ' '],
      placeholder: 'Add filter value here'
    })
     this.elements.searchButton.on('click', this._onSearch.bind(this))
  }

  _onSearch (e) {
    const tagValues = _.map(this.elements.select2Tag.select2('data'), (obj) => {
      return obj.text
    })
    const values = this.elements.select2Value.val()
    this.trigger('search', {
      tags: tagValues,
      values: values,
    })
  }
}
