import { Action } from '@graphiy/actionman'

export default class SavePosition extends Action {
  constructor (p) {
    super(p)
    this._id = 'SavePosition'
    this._deny = true
  }

  _execute (registrar, args) {
    const coords = registrar.currentView.getFixedNodeCoords()
    registrar.itemman.saveCoords(coords)
    registrar.currentView.clearFixed()
  }

  evaluate (registrar, selection) {
    const fixedCount = registrar.currentView.fixedNodes.getCount()
    fixedCount > 0 ? super.evaluate(true) : super.evaluate(false)
  }
}
