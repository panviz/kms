import assert from 'assert'
import _ from 'lodash'
import Graph from '../../../provider/graph/index'

describe('Graph', () => {
  let graph
  describe('associate items', () => {
    const obj = {
      items: {
        i1: 1,
        i2: 2,
      },
      links: {},
    }
    beforeEach(() => {
      graph = new Graph(obj)
    })
    it('both items should reference each other', () => {
      graph.associate('i1', 'i2')
      assert.equal(graph.getLinked('i1')[0], 'i2')
      assert.equal(graph.getLinked('i2')[0], 'i1')
    })
    it('both items reference should have 0 weight by default', () => {
      graph.associate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), 0)
      assert.equal(graph.getLink('i2', 'i1'), 0)
    })
    it('weight should be incremented by 1 on recurrent association', () => {
      graph.associate('i1', 'i2')
      graph.associate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), 1)
      assert.equal(graph.getLink('i2', 'i1'), 0)
    })
    it('self reference is not allowed', () => {
      graph.associate('i1', 'i1')
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('should return changed items', () => {
      const result = graph.associate('i1', 'i2')
      assert.deepEqual(result, ['i1', 'i2'])
    })
    it('should return empty array on missing key argument', () => {
      const result = graph.associate()
      assert(_.isArray(result))
      assert(_.isEmpty(result))
    })
    it('should be able to associate with item not in graph', () => {
      graph.associate('i1', 'i3')
      assert.equal(graph.getLinks('i1').length, 1)
      assert.equal(graph.getLinks('i3').length, 1)
    })
  })
  describe('disassociate items', () => {
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
    beforeEach(() => {
      graph = new Graph(obj)
    })
    it('both items should not reference each other', () => {
      graph.setDisassociate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), undefined)
      assert.equal(graph.getLink('i2', 'i1'), undefined)
    })
    it('should return changed items', () => {
      const result = graph.setDisassociate('i1', 'i2')
      assert.deepEqual(result, ['i1', 'i2'])
    })
    it('should unlink from multiple', () => {
      graph.setDisassociate('i1', ['i2', 'i3'])
      assert.equal(graph.getLink('i1', 'i2'), undefined)
      assert.equal(graph.getLink('i2', 'i1'), undefined)
      assert.equal(graph.getLink('i1', 'i3'), undefined)
      assert.equal(graph.getLink('i3', 'i1'), undefined)
    })
  })
  describe('associate group', () => {
    const obj = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,
      },
      links: {},
    }
    beforeEach(() => {
      graph = new Graph(obj)
    })
    it('should associate first argument item with each one in second argument array', () => {
      graph.associate('i1', ['i2', 'i3'])
      assert.equal(graph.getLink('i1', 'i2'), 0)
      assert.equal(graph.getLink('i1', 'i3'), 0)
      assert.equal(graph.getLink('i2', 'i1'), 0)
      assert.equal(graph.getLink('i3', 'i1'), 0)
    })
    it('should not associate items in array between each other', () => {
      graph.associate('i1', ['i2', 'i3'])
      assert.equal(graph.getLink('i2', 'i3'), undefined)
    })
    it('should return changed items', () => {
      const result = graph.associate('i1', ['i2', 'i3'])
      assert.deepEqual(result, ['i1', 'i2', 'i3'])
    })
  })
})
