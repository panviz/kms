_ = require('lodash')
BackboneEvents = require('backbone-events-standalone')

var assert = require('assert')
, Collection = require('../core/collection')

describe('Collection', function() {
  var selection
  beforeEach(function () {
    selection = new Collection
  })
  describe('CRUD', function () {
    it('should add item', function () {
      selection.add('i1')
      assert(selection.get('i1'))
    })
    it('should add array of items', function () {
      selection.add(['i1', 'i2'])
      assert.deepEqual(selection.getAll(), ['i1', 'i2'])
    })
    it('should return added', function () {
      var result = selection.add(['i1', 'i2'])
      assert.deepEqual(result, ['i1', 'i2'])
    })
    it('should not add anything on no item provided', function () {
      var result = selection.add()
      assert.equal(selection.getCount(), 0)
      assert(!result.length)
    })
    it('should not add duplicate', function () {
      selection.add('i1')
      selection.add('i1')
      assert.equal(selection.getCount(), 1)
    })
    it('should not add non string values', function () {
      selection.add([0, undefined, null, NaN, Infinity, 1, 3.14, false, new Function, [], '', 'i1'])
      assert.equal(selection.getCount(), 1)
    })
    it('should remove item', function () {
      selection.add('i1')
      selection.remove('i1')
      assert(!selection.get('i1'))
    })
    it('should remove array of items', function () {
      selection.add(['i1', 'i2'])
      selection.remove(['i2', 'i1'])
      assert(!selection.get('i1'))
      assert(!selection.get('i2'))
    })
    it('should return removed', function () {
      selection.add(['i1', 'i2'])
      var result = selection.remove(['i2', 'i1'])
      assert.deepEqual(result, ['i2', 'i1'])
    })
    it('should not remove anything if no already selected id provided', function () {
      selection.add(['i1', 'i2'])
      var result = selection.remove([0, undefined, null, NaN, Infinity, 1, 3.14, false, new Function, [], '', 'i3'])
      assert.equal(selection.getCount(), 2)
      assert(!result.length)
    })
    it('should remove everything on clear', function () {
      selection.add(['i1', 'i2'])
      selection.clear()
      assert.equal(selection.getAll(), 0)
    })
  })
  describe('events', function () {
    it('should trigger "change" event on add/remove/clear', function (done) {
      var counter = 0
      function resolve () {
        ++counter
        if (counter === 3) done()
      }
      selection.on('change', resolve)
      selection.add(['i1', 'i2'])
      selection.remove('i1')
      selection.clear()
    })
    it('should trigger "add" event on add', function (done) {
      selection.on('add', function () { done() })
      selection.add('i1')
    })
    it('should trigger "remove" event on remove and clear', function (done) {
      var counter = 0
      function resolve () {
        ++counter
        if (counter === 2) done()
      }
      selection.on('remove', resolve)
      selection.add(['i1', 'i2'])
      selection.remove('i1')
      selection.clear()
    })
    it('should not trigger any events if nothing happend', function (done) {
      var counter = 0
      function resolve () {
        ++counter
      }
      selection.on('add', resolve)
      selection.on('remove', resolve)
      selection.on('change', resolve)
      selection.add([0, undefined, null, NaN, Infinity, 1, 3.14, false, new Function, [], ''])
      selection.remove([0, undefined, null, NaN, Infinity, 1, 3.14, false, new Function, [], '', 'i1'])
      selection.clear()
      setTimeout(function () { assert.equal(counter, 0); done() })
    })
  })
})
