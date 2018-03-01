import { Action } from '@graphiy/actionman'

export default class Create extends Action {
  constructor (p) {
    super(p)
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

  _execute (registrar, args) {
    const selected = registrar.currentView.selection.clear()
    registrar.itemman.createItem(args.sub, selected)
  }

  get icon () {
    return this._icon
  }
}
