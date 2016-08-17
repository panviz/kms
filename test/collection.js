import assert from 'assert'
import Collection from '../core/collection'

describe('Collection', () => {
  let selection
  beforeEach(() => {
    selection = new Collection
  })
  describe('CRUD', () => {
    it('should add item', () => {
      selection.add('i1')
      assert(selection.get('i1'))
    })
    it('should add array of items', () => {
      selection.add(['i1', 'i2'])
      assert.deepEqual(selection.getAll(), ['i1', 'i2'])
    })
    it('should return added', () => {
      const result = selection.add(['i1', 'i2'])
      assert.deepEqual(result, ['i1', 'i2'])
    })
    it('should not add anything on no item provided', () => {
      const result = selection.add()
      assert.equal(selection.getCount(), 0)
      assert(!result.length)
    })
    it('should not add duplicate', () => {
      selection.add('i1')
      selection.add('i1')
      assert.equal(selection.getCount(), 1)
    })
    it('should not add non string values', () => {
      selection.add(
        [0, undefined, null, NaN, Infinity, 1, 3.14, false, function () {}, [], '', 'i1']
      )
      assert.equal(selection.getCount(), 1)
    })
    it('should remove item', () => {
      selection.add('i1')
      selection.remove('i1')
      assert(!selection.get('i1'))
    })
    it('should remove array of items', () => {
      selection.add(['i1', 'i2'])
      selection.remove(['i2', 'i1'])
      assert(!selection.get('i1'))
      assert(!selection.get('i2'))
    })
    it('should return removed', () => {
      selection.add(['i1', 'i2'])
      const result = selection.remove(['i2', 'i1'])
      assert.deepEqual(result, ['i2', 'i1'])
    })
    it('should not remove anything if no already selected id provided', () => {
      selection.add(['i1', 'i2'])
      const result = selection.remove(
        [0, undefined, null, NaN, Infinity, 1, 3.14, false, function () {}, [], '', 'i3']
      )
      assert.equal(selection.getCount(), 2)
      assert(!result.length)
    })
    it('should remove everything on clear', () => {
      selection.add(['i1', 'i2'])
      selection.clear()
      assert.equal(selection.getAll(), 0)
    })
  })
  describe('events', () => {
    it('should trigger "change" event on add/remove/clear', (done) => {
      let counter = 0
      function resolve () {
        ++counter
        if (counter === 3) done()
      }
      selection.on('change', resolve)
      selection.add(['i1', 'i2'])
      selection.remove('i1')
      selection.clear()
    })
    it('should trigger "add" event on add', (done) => {
      selection.on('add', () => { done() })
      selection.add('i1')
    })
    it('should trigger "remove" event on remove and clear', (done) => {
      let counter = 0
      function resolve () {
        ++counter
        if (counter === 2) done()
      }
      selection.on('remove', resolve)
      selection.add(['i1', 'i2'])
      selection.remove('i1')
      selection.clear()
    })
    it('should not trigger any events if nothing happend', (done) => {
      let counter = 0
      function resolve () {
        ++counter
      }
      selection.on('add', resolve)
      selection.on('remove', resolve)
      selection.on('change', resolve)
      selection.add([0, undefined, null, NaN, Infinity, 1, 3.14, false, function () {}, [], ''])
      selection.remove(
        [0, undefined, null, NaN, Infinity, 1, 3.14, false, function () {}, [], '', 'i1']
      )
      selection.clear()
      setTimeout(() => { assert.equal(counter, 0); done() })
    })
  })
})
