import assert from 'assert'
import _ from 'lodash'
import Graph from '../index'

describe('Graph', () => {
  let graph
  beforeEach(() => {
    const obj = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,
      },
      links: {
        i1: [['i2', 0], ['i3', 0]],
        i2: [['i1', 0]],
        i3: [['i1', 0]],
      },
    }
    graph = new Graph(obj)
  })

  describe('create item', () => {
    it('should return new ID for created item', () => {
      const key = graph.set('item')
      assert.equal('item', graph.get(key))
    })
    it('graph stores only strings', () => {
      const key = graph.set(4)
      assert.equal('4', graph.get(key))
    })
    it('should return another ID for setting same value', () => {
      const key = graph.set(3)
      assert.notEqual(key, 'i3')
    })
    it('should create array of items', () => {
      const keys = graph.set([4, 5])
      assert.equal(keys.length, 2)
      assert.equal(graph.get(keys[0]), 4)
      assert.equal(graph.get(keys[1]), 5)
    })
  })

  describe('update item value', () => {
    it('should overwrite existing value', () => {
      graph.set('new', 'i1')
      assert.equal(graph.get('i1'), 'new')
    })
    it('should not remove item with links set with empty string value', () => {
      graph.set('', 'i3')
      assert.equal(graph.get('i3'), '')
    })
    it('should set item with "0" value', () => {
      graph.set(0, 'i3')
      assert.equal(graph.get('i3'), 0)
    })
    it('should not remove item with links set with "undefined" value', () => {
      graph.set(undefined, 'i3')
      assert.equal(graph.get('i3'), '')
    })
  })

  describe('remove item', () => {
    it('graph should not have a value for removed key', () => {
      graph.remove('i1')
      assert.equal(graph.get('i1'), undefined)
    })
    it('graph should not have links for removed item', () => {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('all linked items should not have a reference to deleted item', () => {
      graph.remove('i1')
      assert(_.isEmpty(graph.getLinks('i2')))
      assert(_.isEmpty(graph.getLinks('i3')))
    })
    it('should remove array of items', () => {
      graph.remove(['i2', 'i3'])
      assert.equal(graph.getItemKeys().length, 1)
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('should return array of changed items', () => {
      assert.deepEqual(graph.remove('i1'), ['i1', 'i2', 'i3'])
    })
    it('should remove item if set with no value and links', () => {
      graph.disassociate('i2', 'i1')
      const changed = graph.set('', 'i2')
      assert.equal(changed, 'i2')
      assert.equal(graph.get('i2'), undefined)
    })
  })
})
