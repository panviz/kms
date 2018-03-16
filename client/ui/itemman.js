/**
 * Item manager
 */
import Graph from '@graphiy/graph'
import EventEmitter from 'eventemitter3'
import Util from '../../core/util'

export default class Itemman extends EventEmitter {
  constructor (p = {}) {
    super()
    this.rootKey = '000000001vGeH72LxVtxKg'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype', 'coordinates']
    this.serviceItem = {}
  }

  async showChildren (keyS, dbclick) {
    const keys = Util.pluralize(keyS)
    const rootKey = keys[0]

    this.emit('item:showChildren', rootKey)
  }

  async createItem (p = {}, selected) {
    const key = await Itemman._request('createAndLinkItem', _.concat(this.serviceItem.visibleItem, this.serviceItem[p], selected))
    this.emit('item:create', key)
  }

  async saveItem (value, key) {
    await Itemman._request('set', value, key)
    this.emit('item:save', key)
  }

  async removeItem (keys) {
    await Itemman._request('remove', keys)
    this.emit('item:remove')
  }

  async linkItems (source, targets) {
    await Itemman._request('associate', source, targets)
    this.emit('item:associate')
  }

  async unlinkItems (source, targets) {
    await Itemman._request('setDisassociate', source, targets)
    this.emit('item:disassociate')
  }
  /**
   * Populate view with user data from previous time
   */
  async loadRepo () {
    const graph = await Itemman._request('getGraph', this.rootKey, 1)
    if (_.isEmpty(graph.getItemsMap())) {
      await this._initRepo()
    } else {
      _.each(this._serviceItems.concat(this._itemtypes), (item) => {
        this.serviceItem[item] = graph.search(this.rootKey, item)[0]
      })
      this.serviceItem.root = this.rootKey
    }

    this.emit('repo:load', this.serviceItem.visibleItem)
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
  async reloadGraph (context, depth = 1) {
    const graph = await Itemman._request('getGraph', context, depth)
    this._filter(graph)
    return graph
  }

  async getGraphWithCoords (context, depth = 1) {
    const coords = {}
    const coordinates = this.serviceItem.coordinates
    const graph = await Itemman._request('getGraphWithIntersection', context, depth, coordinates)

    // division of graph and coordinates
    let coordKeys = graph.getLinked(coordinates)
    graph.remove(coordinates)
    coordKeys = coordKeys.slice(coordKeys.indexOf(this.serviceItem.root) + 1)
    _.each(coordKeys, (key) => {
      const linkedNode = graph.getLinks(key)
      coords[linkedNode[0][0]] = graph.get(key)
      graph.remove(key)
    })

    this._filter(graph)
    return { graph, coords }
  }

  _filter (graph) {
    const serviceKeys = _.toArray(this.serviceItem)
    graph.remove(serviceKeys)
    return graph
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

