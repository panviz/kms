import Action from '../action'

export default class SelectChildren extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectChildren'
    this._label = 'Children'
    this._icon = 'mdi mdi-chemical-weapon'
    this.group = 'select'

    this.registrar.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.graphView.selection))
  }

  _execute () {
    const selected = this.registrar.graphView.selection.clear()
    _.each(selected, (item) => {
      this.registrar.graphView.selection.add(this.registrar.itemman.graph.getLinked(item))
    })
  }

  evaluate (selection) {
    const keyS = selection.getAll()
    let links = []
    _.find(keyS, (key) => {
      links = this.registrar.itemman.graph.getLinks(key)
      if (links.length > 0) return true
    })
    links.length ? super._evaluate(true) : super._evaluate(false)
  }
}
