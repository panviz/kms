import Action from '../action'

export default class Save extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemSave'
    this._label = 'Save'
    this._deny = true
    this._icon = 'mdi mdi-content-save'
    this.group = 'item'
  }

  _execute () {
    const key = this.registrar.editor.getKey()
    const value = this.registrar.editor.get()
    this.registrar.itemman.saveItem(value, key)
  }

  evaluate () {
    super._evaluate(this.registrar.editor && this.registrar.editor.isChanged())
  }
}
