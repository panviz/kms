import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'itemEdit'
    this._label = 'Edit'
    this._icon = 'mdi mdi-pencil'
    this.group = 'item'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
    this.registrar.ui.editor.on('show', this.evaluate.bind(this, this.registrar.selection))
    this.registrar.ui.editor.on('hide', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const keys = this.registrar.selection.getAll()
    this.registrar.editItem(keys[0])
  }

  evaluate (selection) {
    if (selection.getCount() === 1 && !this.registrar.ui.editor.isVisible()) this.enable()
    else this.disable()
  }
}
