import Action from '../../action'

export default class Self extends Action {
  constructor (p) {
    super(p)
    this.id = 'selectChildren'
    this._label = 'Children'
    this._icon = 'mdi mdi-chemical-weapon'
    this.group = 'select'
    this.registrar.selection.on('change', this.evaluate.bind(this, this.registrar.selection))
  }

  _execute () {
    const selected = this.registrar.selection.clear()[0]
    this.registrar.selection.add(this.registrar.visibleLinked(selected))
  }

  evaluate (selection) {
    if (selection.getCount() === 1) this.enable()
    else this.disable()
  }
}
