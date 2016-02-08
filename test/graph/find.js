var assert = require('assert')
_ = require('lodash')
, Graph = require('../../provider/graph/index')

describe('Graph', function() {
  beforeEach(function () {
  })

  describe('find graph by value', function () {
    /**
      i1 - i2
      i1 - i3
    */
    var obj1 = {
      items: {
        i1: 'item1',
        i2: 'item2',
        i3: 'another',
      },
      links: {
        i1: [['i2', 0],['i3', 0]],
        i2: [['i1', 0]],
        i3: [['i1', 0]],
      }
    }
    it('should return subgraph with new item and found one', function () {
      var g1 = new Graph(obj1)
      var subGraph = g1.findGraph('ano')
      assert.equal(subGraph.getItemKeys().length, 2)
      assert.equal(subGraph.getLinks('i3').length, 1)
      assert.equal(subGraph.getLinks(subGraph.getKey('ano')).length, 1)
    })
  })
})
