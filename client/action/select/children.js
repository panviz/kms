import Action from '../action'

export default class SelectChildren extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectChildren'
    this._label = 'Children'
    this._icon = 'mdi mdi-chemical-weapon'
    this.group = 'select'
  }

  _execute () {
    const selected = this.registrar.currentView.selection.clear()
    _.each(selected, (item) => {
      this.registrar.currentView.selection.add(this.registrar.currentView.graph.getLinked(item))
    })
  }

  evaluate (selection) {
    const keyS = selection.getAll()
    let links = []
    _.find(keyS, (key) => {
      links = this.registrar.currentView.graph.getLinks(key)
      if (links.length > 0) return true
    })
    links.length ? super._evaluate(true) : super._evaluate(false)
  }
}
