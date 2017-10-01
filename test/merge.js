import assert from 'assert'
import _ from 'lodash'
import Graph from '../../../provider/graph/index'

describe('Graph', () => {
  beforeEach(() => {
  })

  describe('merge completely different graphs', () => {
    /**
      i1 - i2
      i1 - i3
    */
    const obj1 = {
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
    /**
      j1 - j2
      j1 - j2
    */
    const obj2 = {
      items: {
        j1: 1,
        j2: 2,
        j3: 3,
      },
      links: {
        j1: [['j2', 0], ['j3', 0]],
        j2: [['j1', 0]],
        j3: [['j1', 0]],
      },
    }
    it('should include items from both graphs', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      g1.merge(g2)
      assert.equal(g1.get('j1'), 1)
      assert.equal(g1.get('j2'), 2)
      assert.equal(g1.get('j3'), 3)
      assert.equal(g1.getItemKeys().length, 6)
    })
    it('should include links from both graphs', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      g1.merge(g2)
      assert.equal(g1.getLinksArray().length, 4)
    })
  })
  describe('merge graphs with one common item but no common links', () => {
    /**
      i1 - i2
      i1 - i3
    */
    const obj1 = {
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
    /**
      i3 - i4
      i3 - i5
    */
    const obj2 = {
      items: {
        i3: 3,
        i4: 4,
        i5: 5,
      },
      links: {
        i3: [['i4', 0], ['i5', 0]],
        i4: [['i3', 0]],
        i5: [['i3', 0]],
      },
    }
    it('should not contain item duplicates', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      g1.merge(g2)
      assert.equal(g1.getItemKeys().length, 5)
    })
    it('should contain all links', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      g1.merge(g2)
      assert.equal(g1.getLinksArray().length, 4)
      assert.equal(_.keys(g1.getLinksMap()).length, 5)
      assert.equal(g1.getLinks('i3').length, 3)
    })
  })
  describe('merge graph with itself but updated', () => {
    const obj1 = {
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
    /**
      i1 - i2
      i1 - i3
      i2 - i3
    */
    const obj2 = {
      items: {
        i1: 1,
        i2: 2,
        i3: 3,
      },
      links: {
        i1: [['i2', 0], ['i3', 0]],
        i2: [['i1', 0], ['i3', 0]],
        i3: [['i1', 0], ['i2', 0]],
      },
    }
    it('should be the same as updated graph', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      g1.merge(g2)
      assert.equal(JSON.stringify(g1), JSON.stringify(g2))
    })
    it('should return only updated keys', () => {
      const g1 = new Graph(obj1)
      const g2 = new Graph(obj2)
      const changedKeys = g1.merge(g2)
      assert.deepEqual(changedKeys, ['i2', 'i3'])
    })
  })
})
