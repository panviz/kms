import Action from '../action'

export default class Create extends Action {
  constructor (p) {
    super(p)
    this._id = 'itemCreate'
    this._label = 'Create'
    this._icon = 'mdi mdi-plus'
    this._type = 'multi'
    this.group = 'item'
    this._deny = false
    this.submenu = [
      {
        id: this.id,
        icon: 'mdi mdi-tag-outline',
        sub: 'tag',
      }, {
        id: this.id,
        icon: 'mdi mdi-note-outline',
        sub: 'note',
      },
    ]
  }

  _execute (p) {
    const selected = this.registrar.graphView.selection.clear()
    this.registrar.itemman.createItem(p.sub, selected)
  }
}
