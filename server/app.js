/**
 * Server Application
 * perform complex actions delegated from client application
 */
import _ from 'lodash'
import Raw from '@graphiy/provider-raw'
import Util from '../core/util'

export default class Self {
  constructor (p) {
    this.rootKey = '000000001vGeH72LxVtxKg'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}
    this.p = p

    this.provider = Raw
    this._readGraph()
  }

  async _readGraph () {
    const graph = await this.provider.read(this.p.repository.path)
    this.graph = graph
    console.info(`Serving items total: ${graph.getItemKeys().length} from ${this.p.repository.path}`)
    this._initServiceItems()
  }

  _initServiceItems () {
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      this.serviceItem[item] = this.graph.search(this.rootKey, item)[0]
    })
    this.serviceItem.root = this.rootKey
  }

  _changeItemsInStoradge (result) {
    _.each(result, (key) => {
      this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)
    })
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

  createAndLinkItem (linkedKeys) {
    const newKey = this.graph.set()
    const result = this.graph.associate(newKey, linkedKeys)
    this._changeItemsInStoradge(result)

    return Promise.resolve(newKey)
  }

  getGraph (context, depth = 1) {
    const contextS = Util.pluralize(context)
    return Promise.resolve(this.graph.getGraph(contextS, depth))
  }

  remove (keys) {
    const result = this.graph.remove(keys)
    this._changeItemsInStoradge(result)

    return Promise.resolve()
  }

  set (value, key) {
    this.graph.set(value, key)
    this.provider.set(key, this.graph.get(key), this.graph.getLinks(key), this.p)

    return Promise.resolve()
  }

  get (key) {
    return Promise.resolve(this.graph.get(key))
  }

  associate (source, target) {
    const result = this.graph.associate(source, target, 1, this.p)
    this._changeItemsInStoradge(result)

    return Promise.resolve()
  }

  setDisassociate (source, target) {
    const result = this.graph.disassociate(source, target)
    this._changeItemsInStoradge(result)

    return Promise.resolve()
  }

  merge (graph) {
    const result = this.graph.merge(graph)
    this._changeItemsInStoradge(result)

    return Promise.resolve()
  }
}
