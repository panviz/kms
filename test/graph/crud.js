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
  })
  describe('remove item', function () {
    it('graph should not have a value for its key', function () {
      graph.remove('i1')
      assert.equal(graph.get('i1'), undefined)
    })
    it('graph should not have links for removed item', function () {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('linked items should not have a reference to deleted item', function () {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i2')))
      assert(_.isEmpty(graph.getLinks('i3')))
    })
  })
})
