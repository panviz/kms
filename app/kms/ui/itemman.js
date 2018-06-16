/**
 * Item manager
 */
import EventEmitter from 'eventemitter3'
import Graph from '@graphiy/graph'

export default class Itemman extends EventEmitter {
  constructor (p = {}) {
    super()
    this.rootKey = '000000001vGeH72LxvRoot'
    this._itemtypes = ['tag', 'note']
    this.serviceItems = {
      itemtype: '00W3WxfzJQCtmSeInhITyp',
      visibleItem: '00xVUNkOdwLlHwgwmhVIte',
      coordinates: '00BLRXR6lYBuppxFfuCoor',
      views: '00bLkMBFmOenAhJAUqView',
      tag: '00IxataPXfqi2OSQ4GrTag',
      note: '001AaffVwnMf9irEeoNote',
    }
    this.viewItems = []
  }

  async showChildren (viewKey) {
    this.emit('item:showChildren', viewKey)
  }

  async createItem (p = {}, selected) {
    const key = await Itemman._request('createAndLinkItem', _.concat(this.serviceItems.visibleItem, this.serviceItems[p], selected))
    this.emit('item:create', key)
  }

  async saveItem (value, key) {
    await Itemman._request('set', value, key)
    this.emit('item:save', key)
  }

  async removeItem (keys) {
    await Itemman._request('remove', keys, this.serviceItems.coordinates)
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
    }
    this.emit('repo:load', this.serviceItems.visibleItem)
  }

  _initRepo () {
    const graph = new Graph
    graph.set('root', this.rootKey)
    _.each(this.serviceItems, (key, value) => {
      graph.set(value, key)
      graph.associate(this.rootKey, key)
      if (this._itemtypes.includes(value)) {
        graph.associate(this.serviceItems.itemtype, key)
      }
    })
    return Itemman._request('merge', graph)
  }

  async initViewNode (view, key) {
    await Itemman._request('set', JSON.stringify(view), key)
    await Itemman._request('associate', key, this.serviceItems.views)
    this.viewItems.push(key)
  }

  /**
   * Sync graph with server
   */
  async reloadGraph (context = this.serviceItems.visibleItem, depth = 1) {
    const graph = await Itemman._request('getGraph', context, depth)
    this._filter(graph)
    graph.remove(context)
    return graph
  }

  async saveCoords (coords, viewKey, type) {
    const keys = await Itemman._request('saveCoords', _.concat(this.serviceItems.coordinates, coords, viewKey, type))
    this.emit('coords:save', keys)
  }

  async deleteCoords (selection, viewKey, type) {
    await Itemman._request('deleteCoords', _.concat(this.serviceItems.coordinates, [selection], viewKey, type))
    this.emit('coords:delete', viewKey)
  }

  async getGraphWithCoords (context = this.serviceItems.visibleItem, viewKey, depth = 1) {
    const coords = {}
    const coordinates = this.serviceItems.coordinates
    const graph = await Itemman._request('getGraphWithIntersection', context, depth, [coordinates, viewKey])

    graph.remove(context)
    // division of graph and coordinates
    const coordKeys = graph.getLinked(coordinates)
    graph.remove(coordinates)
    _.each(coordKeys, (key) => {
      const linkedNode = graph.getLinks(key)
      if (linkedNode.length > 0) {
        coords[linkedNode[0][0]] = graph.get(key)
      }

      graph.remove(key)
    })

    graph.remove(this.viewItems)
    this._filter(graph)
    return { graph, coords }
  }

  _filter (graph) {
    const serviceKeys = _.toArray(this.serviceItems)
    graph.remove(serviceKeys)
    graph.remove(this.rootKey)
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

