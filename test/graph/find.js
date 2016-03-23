import assert from 'assert'
import _ from 'lodash'
import Graph from '../../provider/graph/index'

describe('Graph', function () {
  describe('find graph by value', function () {
    var graph
    /**
      i1 - i2
      i1 - i3
    */
    var obj = {
      items: {
        i1: 'item1',
        i2: 'item2',
        i3: 'another',
      },
      links: {
        i1: [['i2', 0], ['i3', 0]],
        i2: [['i1', 0]],
        i3: [['i1', 0]],
      },
    }
    beforeEach(function () {
      graph = new Graph(obj)
    })
    it('should return subgraph with lookup item and found items linked to it', function () {
      var lookupValue = 'NOT'
      var subGraph = graph.find(lookupValue, 'i')

      //assert.equal(subGraph.getItemKeys().length, 2)
      //assert.equal(subGraph.getLinks(subGraph.getKey(lookupValue)).length, 1)
    })
    it('subGraph should not contain linked items of search results', function () {
      var lookupValue = 'ano'
      var subGraph = graph.find(lookupValue)

      //assert.equal(subGraph.getLinks('i3').length, 1)
    })
    it('should return subgraph with lookup item only', function () {
      var lookupValue = 'miss'
      var subGraph = graph.find(lookupValue, 'i')

      //var lookupKey = subGraph.getKey(lookupValue)
      //assert(lookupKey)
      //assert.equal(subGraph.getLinks(lookupKey).length, 0)
    })
  })
})
