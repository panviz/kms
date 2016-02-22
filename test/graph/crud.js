var assert = require('assert')
_ = require('lodash')
, Graph = require('../../provider/graph/index')

describe('Graph', function() {
  var graph
  beforeEach(function () {
    var obj = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,
      },
      links: {
        i1: [['i2', 0],['i3', 0]],
        i2: [['i1', 0]],
        i3: [['i1', 0]],
      }
    }
    graph = new Graph(obj)
  })

  describe('create item', function () {
    it('should return new ID for created item', function () {
      var key = graph.set('item')
      assert.equal(key, graph.getKey('item'))
    })
    it('graph stores only strings', function () {
      var key = graph.set(4)
      assert.equal(key, graph.getKey('4'))
    })
    it('should return existing item ID for setting same value', function () {
      var key = graph.set(3)
      assert.equal(key, 'i3')
    })
    it('should create array of items', function () {
      var keys = graph.set([4,5])
      assert.equal(keys.length, 2)
      assert.equal(graph.get(keys[0]), 4)
      assert.equal(graph.get(keys[1]), 5)
    })
  })

  describe('update item value', function () {
    it('should overwrite existing value', function () {
      graph.set('new', 'i1')
      assert.equal(graph.get('i1'), 'new')
    })
    it('should not remove item with links set with empty string value', function () {
      graph.set('', 'i3')
      assert.equal(graph.get('i3'), '')
    })
    it('should set item with "0" value', function () {
      graph.set(0, 'i3')
      assert.equal(graph.get('i3'), 0)
    })
    it('should not remove item with links set with "undefined" value', function () {
      graph.set(undefined, 'i3')
      assert.equal(graph.get('i3'), '')
    })
  })

  describe('remove item', function () {
    it('graph should not have a value for removed key', function () {
      graph.remove('i1')
      assert.equal(graph.get('i1'), undefined)
    })
    it('graph should not have links for removed item', function () {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('all linked items should not have a reference to deleted item', function () {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i2')))
      assert(_.isEmpty(graph.getLinks('i3')))
    })
    it('should remove array of items', function () {
      graph.remove(['i2', 'i3'])
      assert.equal(graph.getItemKeys().length, 1)
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('should return array of changed items', function () {
      assert.deepEqual(graph.remove('i1'), ['i1', 'i2', 'i3'])
    })
    it('should remove item if set with no value and links', function () {
      graph.setDisassociate('i2', 'i1')
      var changed = graph.set('', 'i2')
      assert.equal(changed, 'i2')
      assert.equal(graph.get('i2'), undefined)
    })
  })
})
