import Action from '../action'

export default class Edit extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemEdit'
    this._label = 'Edit'
    this._icon = 'mdi mdi-pencil'
    this.group = 'item'

    this.registrar.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.graphView.selection))
    this.registrar.editor.on('show', this.evaluate.bind(this, this.registrar.graphView.selection))
    this.registrar.editor.on('hide', this.evaluate.bind(this, this.registrar.graphView.selection))
  }

  _execute () {
    const key = this.registrar.graphView.selection.getAll()[0]
    const value = this.registrar.itemman.graph.get(key)
    this.registrar.itemman.editItem(key, value)
  }

  evaluate (selection) {
    super._evaluate(selection.getCount() === 1 && !this.registrar.editor.isVisible())
  }
}
