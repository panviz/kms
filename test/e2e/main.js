const _ = require('lodash')
const assert = require('assert')
const nightmare = require('nightmare')
const runner = require('../../server/runner')

describe('Node manipulation', () => {
  describe('Create', () => {
    let nm
    before((done) => {
      runner.config('./build/server/instance.js')
      runner.start(done)
    })
    beforeEach(() => {
      nm = nightmare()
    })
    afterEach((done) => {
      nm.end(done)
    })
    after((done) => {
      runner.stop(done)
    })
    it('should create item by menu', (done) => {
      nm
        .goto('http://localhost:8000')
        .click('li.action[data-id="itemCreate"]')
        .wait('.container')
        .evaluate(() => {
          const res = {}
          res.visibleItems = G.visibleItems.getAll()
          res.id = document.querySelector('.container .canvas .node.selected').__data__
          return res
        })
        .then((res) => {
          assert(_.includes(res.visibleItems, res.id))
          done()
        })
    })
  })
  describe('Delete', () => {
    //it('should delete item by menu', (done) => {
      //done()
    //})
  })
})
