import Action from '../action'

export default class Edit extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemEdit'
    this._label = 'Edit'
    this._icon = 'mdi mdi-pencil'
    this.group = 'item'

    this.registrar.ui.graphView.selection.on('change', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
    this.registrar.ui.editor.on('show', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
    this.registrar.ui.editor.on('hide', this.evaluate.bind(this, this.registrar.ui.graphView.selection))
  }

  _execute () {
    const keys = this.registrar.ui.graphView.selection.getAll()
    this.registrar.editItem(keys[0])
  }

  evaluate (selection) {
    super._evaluate(selection.getCount() === 1 && !this.registrar.ui.editor.isVisible())
  }
}
