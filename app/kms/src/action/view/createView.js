import { Action } from '@graphiy/actionman'

export default class CreateView extends Action {
  constructor (p) {
    super(p)
    this._id = 'CreateView'
    this._deny = false
  }

  _execute (registrar, args) {
    registrar.createNewView()
  }
}
