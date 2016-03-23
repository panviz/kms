import assert from 'assert'
import _ from 'lodash'
import Graph from '../../provider/graph/index'

describe('Graph', function () {
  describe('get subGraph', function () {
    var graph
    /**
      i1 - i2
      i1 - i3
    */
    var obj = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,

        // this value is left blank intentionally
        i4: '',
        i5: 5,
      },
      links: {
        i1: [['i2', 0], ['i3', 0]],
        i2: [['i1', 0], ['i3', 0]],
        i3: [['i1', 0], ['i2', 0], ['i4', 0]],
        i4: [['i3', 0], ['i5', 0]],
        i5: [['i4', 0]],
      },
    }
    beforeEach(function () {
      graph = new Graph(obj)
    })
    it('should return graph with only one item for default 0 depth', function () {
      var subGraph = graph.getGraph('i3')
      assert.equal(subGraph.getItemKeys().length, 1)
      assert.equal(subGraph.getLinksArray().length, 0)
    })
    it('should return subGraph with item and linked to it for depth 1', function () {
      var subGraph = graph.getGraph('i1', 1)
      assert.equal(subGraph.getItemKeys().length, 3)
      assert.deepEqual(subGraph.getLinksArray(), [['i1', 'i2'], ['i1', 'i3'], ['i2', 'i3']])
    })
    it('should return graph with two items for requested array with depth 0', function () {
      var subGraph = graph.getGraph(['i1', 'i4'])
      assert.deepEqual(subGraph.getItemKeys(), ['i1', 'i4'])
      assert.equal(subGraph.getLinksArray().length, 0)
    })
    it('should return graph with two items and links between them for requested array with depth 0', function () {
      var subGraph = graph.getGraph(['i2', 'i3'])
      assert.equal(subGraph.getLinksArray().length, 1)
    })
    it('should return subGraph with all items and linked to it for depth 1', function () {
      var subGraph = graph.getGraph(['i1', 'i5'], 1)
      assert.equal(subGraph.getItemKeys().length, 5)
      assert.equal(subGraph.getLink('i3', 'i4'), 0)
    })
  })
})
