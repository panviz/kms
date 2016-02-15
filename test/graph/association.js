var assert = require('assert')
_ = require('lodash')
, Graph = require('../../provider/graph/index')

describe('Graph', function() {
  var graph
  describe('associate items', function () {
    var obj = {
      items: {
        i1: 1,
        i2: 2,
      },
      links: {}
    }
    beforeEach(function () {
      graph = new Graph(obj)
    })
    it('both items should reference each other', function () {
      graph.associate('i1', 'i2')
      assert.equal(graph.getLinked('i1')[0], 'i2')
      assert.equal(graph.getLinked('i2')[0], 'i1')
    })
    it('both items reference should have 0 weight by default', function () {
      graph.associate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), 0)
      assert.equal(graph.getLink('i2', 'i1'), 0)
    })
    it('weight should be incremented by 1 on recurrent association', function () {
      graph.associate('i1', 'i2')
      graph.associate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), 1)
      assert.equal(graph.getLink('i2', 'i1'), 0)
    })
    it('self reference is not allowed', function () {
      graph.associate('i1', 'i1')
      assert(_.isEmpty(graph.getLinks('i1')))
    })
    it('should return changed items', function () {
      var result = graph.associate('i1', 'i2')
      assert.deepEqual(result, ['i1', 'i2'])
    })
    it('should return empty array on missing key argument', function () {
      var result = graph.associate()
      assert(_.isArray(result))
      assert(_.isEmpty(result))
    })
    it('should return empty array if linked item is missing', function () {
      var result = graph.associate('i1', 'i3')
      assert(_.isArray(result))
      assert(_.isEmpty(result))
    })
  })
  describe('disassociate items', function () {
    var obj = {
      items: {
        i1: 1,
        i2: 2,
      },
      links: {
        i1: [['i2', 0]],
        i2: [['i1', 0]],
      }
    }
    beforeEach(function () {
      graph = new Graph(obj)
    })
    it('both items should not reference each other', function () {
      graph.setDisassociate('i1', 'i2')
      assert.equal(graph.getLink('i1', 'i2'), undefined)
      assert.equal(graph.getLink('i2', 'i1'), undefined)
    })
    it('should return changed items', function () {
      var result = graph.setDisassociate('i1', 'i2')
      assert.deepEqual(result, ['i1', 'i2'])
    })
  })
  describe('associate group', function () {
    var obj = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,
      },
      links: {}
    }
    beforeEach(function () {
      graph = new Graph(obj)
    })
    it('should associate first argument item with each one in second argument array', function () {
      graph.associateGroup('i1', ['i2', 'i3'])
      assert.equal(graph.getLink('i1', 'i2'), 0)
      assert.equal(graph.getLink('i1', 'i3'), 0)
      assert.equal(graph.getLink('i2', 'i1'), 0)
      assert.equal(graph.getLink('i3', 'i1'), 0)
    })
    it('should not associate items in array between each other', function () {
      graph.associateGroup('i1', ['i2', 'i3'])
      assert.equal(graph.getLink('i2', 'i3'), undefined)
    })
    it('should return changed items', function () {
      var result = graph.associateGroup('i1', ['i2', 'i3'])
      assert.deepEqual(result, ['i1', 'i2', 'i3'])
    })
  })
})
