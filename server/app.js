/**
 * Server Application
 * perform complex actions delegated from client application
 */

import _ from 'lodash'
import Util from '../core/util'

export default class Self {
  constructor (graph) {
    this.rootKey = '00000000-0000-4000-8000-000000000000'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}
    this.graph = graph

    this._getServiseItems()
  }

  _getServiseItems(){
    let serviceGraph = this.graph.getGraph(this.rootKey, 1)
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      this.serviceItem[item] = this.graph.search(this.rootKey, item)[0]
    })
    this.serviceItem.root = this.rootKey
  }
  /**
   * Find Items by value from root
   * @param p
   */
  findNodesByTags(p){
    return new Promise((resolve, reject) => {
      const args = JSON.parse(p)
      const root = args.root
      const values = Util.pluralize(args.tags)
      const nodesResult =[]
      _.each(values, value => {
        nodesResult.push(this.graph.search(root, value, 'g')[0])
      })
      let arrLinkedKeys = _.map(nodesResult, key => this.graph.getLinked(key))
      arrLinkedKeys = _.union(...arrLinkedKeys)

      const serviceKeys = this.graph.find(this.rootKey)
      _.pullAll(arrLinkedKeys, serviceKeys)

      let itemsMap ={}
      _.each(arrLinkedKeys, key => {
        itemsMap[key] =  this.graph.get(key)
      })
      resolve(itemsMap)
    })
  }

  initAutocomplit(query) {
    return new Promise((resolve, reject) => {
      let data = []
      const serviceKeys = []
      const nodeHashes = this.graph.search(this.serviceItem.tag, query, 'g')
      for (let key in this.serviceItem) {
        serviceKeys.push(this.serviceItem[key])
      }
      _.pullAll(nodeHashes, serviceKeys)

      _.each(nodeHashes, (nodeHash) => {
        const nodeValue = this.graph.get(nodeHash)
        data.push({id: nodeHash, text: nodeValue})
      })
      resolve(data)
    })
  }


}