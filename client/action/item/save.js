import Action from '../action'

export default class Save extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemSave'
    this._label = 'Save'
    this._deny = true
    this._icon = 'mdi mdi-content-save'
    this.group = 'item'

    this.registrar.ui.editor.on('change', this.evaluate.bind(this))
  }

  _execute () {
    const key = this.registrar.ui.editor.getKey()
    const value = this.registrar.ui.editor.get()
    this.registrar.saveItem(value, key)
  }

  evaluate () {
    super._evaluate(this.registrar.ui.editor && this.registrar.ui.editor.isChanged())
  }
}
