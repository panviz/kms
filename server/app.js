/**
 * Server Application
 * perform complex actions delegated from client application
 */

import _ from 'lodash'
import Util from '../core/util'
import Raw from '../provider/raw/index'
import APIServer from '../provider/api.server/index'

export default class Self {
  constructor (p) {
    this.rootKey = '000000001vGeH72LxVtxKg'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}
    this.p = p

    // todo delete and change in raw provider line 84 p.target => p.repository.path
    this.p.target = this.p.repository.path

    this.provider = Raw
    this.provider.read(this.p.repository.path)
      .then((graph) => {
        this.graph = graph
        console.info(`Serving items total: ${graph.getItemKeys().length} from ${this.p.repository.path}`)
        this.apiServer = new APIServer({
          source: this.p.repository.path,
          target: this.p.repository.path,
          graph: this.graph,
          provider: this.provider,
        })
        this._initServiceItems()
      })
  }

  _initServiceItems () {
    const serviceGraph = this.graph.getGraph(this.rootKey, 1)
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      this.serviceItem[item] = this.graph.search(this.rootKey, item)[0]
    })
    this.serviceItem.root = this.rootKey
  }
  /**
   * Find Items by value from root
   * @param p
   */
  findNodesByTags (p) {
    return new Promise((resolve, reject) => {
      const args = JSON.parse(p)
      const tagsAnd = Util.pluralize(args.tagsAnd)
      const tagsOr = Util.pluralize(args.tagsOr)
      const serviceKeys = this.graph.find(this.rootKey)
      const itemsMap = {}
      let arrLinkedKeysOr = []
      let arrLinkedKeysAnd = []

      if (tagsOr.length > 0) {
        const tags = []
        _.each(tagsOr, (value) => {
          tags.push(this.graph.search(this.serviceItem.tag, value, 'g')[0])
        })
        arrLinkedKeysOr = _.map(tags, key => this.graph.getLinked(key))
        arrLinkedKeysOr = _.intersection(...arrLinkedKeysOr)
      }

      if (tagsAnd.length > 0) {
        const tags = []
        _.each(tagsAnd, (value) => {
          tags.push(this.graph.search(this.serviceItem.tag, value, 'g')[0])
        })
        arrLinkedKeysAnd = _.map(tags, key => this.graph.getLinked(key))
        arrLinkedKeysAnd = _.union(...arrLinkedKeysAnd)
      }

      const arrLinkedKeys = _.union(arrLinkedKeysOr, arrLinkedKeysAnd)
      _.pullAll(arrLinkedKeys, serviceKeys)

      _.each(arrLinkedKeys, (key) => {
        itemsMap[key] = this.graph.get(key)
      })

      resolve(itemsMap)
    })
  }

  /**
   * retrieves tags in select2 consumable format by search query
   * @param {String} query
   * @returns {Promise}
   */
  searchTags (query) {
    return new Promise((resolve, reject) => {
      const tagKeys = this.graph.search(this.serviceItem.tag, query, 'g')
      const serviceKeys = _.keys(this.serviceItem)
      _.pullAll(tagKeys, serviceKeys)

      const data = _.map(tagKeys, key => ({ id: key, text: this.graph.get(key) }))
      resolve(data)
    })
  }

  createAndLinkItem (args) {
    const linkedKeys = JSON.parse(args)[0]
    const newKey = this.graph.set()
    const result = this.graph.associate(newKey, linkedKeys)

      return new Promise((resolve, reject) => {
        _.each(result, (key) => {
            this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
        })
      resolve()
    })
  }

  getGraph (args) {
    const data = JSON.parse(args)
    const weight = data[1]
    const contextS = Util.pluralize(data[0])
    return new Promise((resolve, reject) => {
      resolve(this.graph.getGraph(contextS, weight))
    })
  }

  remove (keys) {
    const result = this.graph.remove(JSON.parse(keys)[0])
    return new Promise((resolve, reject) => {
      _.each(result, (key) => {
        this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
      })
      resolve()
    })
  }

  set (args) {
    const data = JSON.parse(args)
    const value = data[0]
    let key = data[1]
    key = this.graph.set(value, key)

    return new Promise((resolve, reject) => {
      this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
      resolve(key)
    })
  }

  get (args) {
    const data = JSON.parse(args)
    const key = data[0]
    return new Promise((resolve, reject) => {
      resolve(this.graph.get(key))
    })
  }

  associate (args) {
    const data = JSON.parse(args)
    const source = data[0]
    const target = data[1]
    const result = this.graph.associate(source, target, 1, this.p)

    return new Promise((resolve, reject) => {
      _.each(result, (key) => {
        this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
      })
      resolve()
    })
  }

  setDisassociate (args) {
    const data = JSON.parse(args)
    const source = data[0]
    const target = data[1]
    const result = this.graph.setDisassociate(source, target)

    return new Promise((resolve, reject) => {
      _.each(result, (key) => {
        this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
      })
      resolve()
    })
  }

  merge (args) {
      const data = JSON.parse(args)
      const graph = data[0]
      const result = this.graph.merge(graph)

      return new Promise((resolve, reject) => {
          _.each(result, (key) => {
              this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
          })
          resolve()
      })
  }
}
