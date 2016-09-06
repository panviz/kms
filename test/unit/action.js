import assert from 'assert'
import Action from '../../client/action'

class TestAction extends Action {
  constructor (p) {
    super(p)
    this._id = 'test'
    this._label = 'label'
    this._icon = 'icon'
    this._type = 'type'
    this.group = 'group'
  }

  evaluate (p) {
    super._evaluate(p)
  }

  _execute (p) {
    return 1
  }
}

let action
beforeEach(() => {
  action = new TestAction
})

describe('Action', () => {
  it('should not change id', () => {
    assert.throws(() => { action.id = 'asdf' }, /Cannot set property id/)
  })
  it('should be able to change icon', () => {
    assert(action.icon, 'icon')
    action.icon = 'newicon'
    assert(action.icon, 'newicon')
  })
  it('should be able to change label', () => {
    assert(action.label, 'label')
    action.label = 'newlabel'
    assert(action.label, 'newlabel')
  })
  it('should be disabled by default', () => {
    const result = action.apply()
    assert.equal(result, undefined)
  })
  it('should be applied when enabled', () => {
    action.enable()
    const result = action.apply()
    assert.equal(result, 1)
  })
  it('should be disabled by disable function', () => {
    action.enable()
    action.disable()
    assert(!action.isEnabled())
  })
  it('should enable by evaluating to false', () => {
    action.evaluate(true)
    assert(action.isEnabled())
  })
  it('should trigger event on being enabled', (done) => {
    action.on('enable', () => { done() })
    action.enable()
  })
  it('should not be undoable by default', () => {
    assert(!action.canUndo())
  })
})

