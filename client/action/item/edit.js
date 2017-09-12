import Action from '../action'

export default class Edit extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemEdit'
    this._label = 'Edit'
    this._icon = 'mdi mdi-pencil'
    this.group = 'item'
  }

  _execute (title) {
    const key = this.registrar.graphView.selection.getAll()[0]
    const value = this.registrar.graphView.graph.get(key)
    this.registrar.editor.set(value, key)
    this.editor.setTitle(title)
    this.editor.show()
  }

  evaluate (selection) {
    super._evaluate(selection.getCount() === 1 && !this.registrar.editor.isVisible())
  }
}
