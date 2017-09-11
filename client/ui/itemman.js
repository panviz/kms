/**
 * Item manager
 */
import EventEmitter from 'eventemitter3'
import Util from '../../core/util'
import ClientUtil from '../util' //eslint-disable-line
import Graph from '../../provider/graph/index'


export default class Itemman extends EventEmitter {
  constructor (p = {}) {
    super()
    this.rootKey = '000000001vGeH72LxVtxKg'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}
  }

  async showChildren (keyS, dbclick) {
    const keys = Util.pluralize(keyS)
    const rootKey = keys[0]

    this.trigger('item:showChildren', rootKey)
  }

  async createItem (p = {}, selected) {
    const key = await Itemman._request('createAndLinkItem', _.concat(this.serviceItem.visibleItem, this.serviceItem[p], selected))
    this.trigger('item:create', key)
  }

  async saveItem (value, key) {
    await Itemman._request('set', value, key)
    this.trigger('item:saved', key)
  }

  async removeItem (keys) {
    await Itemman._request('remove', keys)
    this.trigger('item:remove')
  }

  async linkItems (source, targets) {
    await Itemman._request('associate', source, targets)
    this.trigger('item:associate')
  }

  async unlinkItems (source, targets) {
    await Itemman._request('setDisassociate', source, targets)
    this.trigger('item:disassociate')
  }
  /**
   * Populate view with user data from previous time
   */
  async _loadRepo () {
    const graph = await Itemman._request('getGraph', this.rootKey, 1)
    if (_.isEmpty(graph.getItemsMap())) {
      await this._initRepo()
    } else {
      _.each(this._serviceItems.concat(this._itemtypes), (item) => {
        this.serviceItem[item] = graph.search(this.rootKey, item)[0]
      })
      this.serviceItem.root = this.rootKey
    }

    this.trigger('repo:load', this.serviceItem.visibleItem)
  }

  _initRepo () {
    const graph = new Graph
    graph.set('root', this.rootKey)
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      if (item === 'root') return
      this.serviceItem[item] = graph.set(item)
      graph.associate(this.rootKey, this.serviceItem[item])
      if (this._itemtypes.includes(item)) {
        graph.associate(this.serviceItem.itemtype, this.serviceItem[item])
      }
    })
    return Itemman._request('merge', graph)
  }
  /**
   * Sync graph with server
   */
  async _reloadGraph (context, depth = 1) {
    const graph = await Itemman._request('getGraph', context, depth)
    this._filter(graph)
    return graph
  }

  _filter (data) {
    let graph
    let keys
    const serviceKeys = _.toArray(this.serviceItem)
    if (data.providerID) graph = data
    if (_.isArray(data)) keys = data
    if (graph) {
      graph.remove(serviceKeys)
      return graph
    }
    _.pullAll(keys, serviceKeys)
    return keys
  }
  /**
   * Translate graph function calls to server
   */
  static async _request (method, ...args) {
    const data = await $.post({
      url: '/graph/',
      data: {
        method,
        args: JSON.stringify(args),
      },
    })
    return data.items && data.links ? new Graph(data) : data
  }
}

