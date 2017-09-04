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
    const keys = this.registrar.graphView.selection.getAll()
    this.registrar.itemman.editItem(keys[0])
  }

  evaluate (selection) {
    super._evaluate(selection.getCount() === 1 && !this.registrar.editor.isVisible())
  }
}
