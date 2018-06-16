import assert from 'assert'
import Graph from '@graphiy/graph'
import * as Provider from '../index'

describe('Provider Raw', () => {
  describe('API', () => {
    it('should satisfy Graphiy provider API', () => {
      assert(Provider.read)
      assert(Provider.write)
      assert(Provider.get)
      assert(Provider.set)
    })
    it('read empty repo', async () => {
      const graph = await Provider.read('./fixture')
      assert(graph instanceof Graph)
    })
  })
})
