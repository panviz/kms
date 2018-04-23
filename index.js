/**
 * Graph Data Model
 * In memory Associative storage
 *
 * Internal format is adjacency list where links are stored in redundant format:
 * each item's key has array of its links
 * Link is an array of key and weight
 */
import _ from 'lodash'
import uuidBase62 from 'uuid62'

function filterKeys (obj, filter) {
  const filtered = {}
  _.each(obj, (value, key) => {
    if (filter(value)) {
      filtered[key] = value
    }
  })
  return filtered
}
/**
 * Compare two Links
 */
function compareWeight (link1, link2) {
  return link1[1] > link2[1] ? 1 : -1
}
/**
 * generate random UUID
 */
function generateID () {
  return uuidBase62.v4()
}
/**
 * do not allow self reference
 */
function validateKeys (key1, key2) {
  return key1 && key2 && key1 !== key2
}

const idPattern = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/g

export default class Graph {
  constructor (p = {}) {
    this._context = _.cloneDeep(p.context) || {}
    this._items = _.cloneDeep(p.items) || {}
    this._links = _.cloneDeep(p.links) || {}
  }
  /**
   * Doesn't allow override except if key is specified exactly
   * @param {String|Array} data values of items to be set
   * @param Key (optional) key of the item to set data to
   * @return Key ID for existing item if any
   */
  set (_data, _key) {
    let key = _key
    let data = _data
    if (_.isArray(data)) return _.map(data, datum => this.set(datum))

    if (data === '' || _.isNil(data)) {
      if (key && _.isEmpty(this.getLinks(key))) return this.remove(key)
      key = key || generateID()

      // Ensure value is not undefined, as JSON stringify will omit it
      data = ''
    } else {
      key = key || generateID()
    }
    this._items[key] = data
    return key
  }
  /**
   * remove key, value, its links and its reference from all item which links to it
   */
  remove (keyS) {
    const keys = _.castArray(keyS)
    const changed = _.map(keys, this._remove.bind(this))
    return _.union(...changed)
  }

  _remove (key) {
    const linkedKeys = this.getLinked(key)
    _.each(linkedKeys, (linkedKey) => { this.disassociate(key, linkedKey) })
    delete this._items[key]
    delete this._links[key]

    return _.union([key], linkedKeys)
  }
  /**
   * Merge this with provided graph
   * leave existing values and links weights on coincidence
   * @param Graph graph
   * @param Boolean p.overwrite existing items values with provided
   */
  complement (graph) {
    this.merge(graph, { overwrite: false })
  }
  /**
   * Merge this with provided graph
   * overwrite existing values and links weights
   * links are summed
   * @param Graph graph
   * @param Boolean p.overwrite existing items values with provided
   */
  merge (_graph, p = { overwrite: true }) {
    if (!_graph) return []
    const graph = _graph.items ? new Graph(_graph) : _graph
    const newItems = graph.getItemsMap()
    const changed = []

    _.each(newItems, (newValue, newKey) => {
      const existingValue = this._items[newKey]
      const valueExist = existingValue !== undefined
      if (valueExist && !p.overwrite) return
      if (valueExist && existingValue !== newValue) changed.push(newKey)
      this._items[newKey] = newValue
    })

    // walk through all items with links
    // add only forward link for each item, as graph may not have linked item
    // or it must have backlink and would be added in this loop in further iterations
    _.each(graph.getLinksMap(), (newLinks, newItemWithLinksKey) => {
      const existLinks = this._links[newItemWithLinksKey]
      if (!existLinks) {
        changed.push(newItemWithLinksKey)
        this._links[newItemWithLinksKey] = newLinks
        _.each(newLinks, (newLink) => { changed.push(newLink[0]) })
      } else {
        // update each link individually
        _.each(newLinks, (newLink) => {
          const existLink = _.find(existLinks, existingLink => existingLink[0] === newLink[0])
          if (existLink && !p.overwrite) return
          if (existLink) {
            // if only weight for existing link is updated
            if (existLink[1] !== newLink[1]) changed.push(newItemWithLinksKey)
            existLink[1] = newLink[1]
          } else {
            existLinks.push(newLink)
            changed.push(newItemWithLinksKey)
          }
        })
      }
    })
    return _.uniq(changed)
  }
  /**
   * @param Key Item ID
   * @return String Item data
   */
  get (key) {
    return this._items[key]
  }
  /**
   * @return Object all stored items
   */
  getItemsMap () {
    return this._items
  }
  /**
   * @return Array of keys
   */
  getItemKeys () {
    return _.keys(this._items)
  }
  /**
   * Create link between two Items
   * Item may be absent in graph. This is useful for referencing items in other graphs/providers
   * @param Key Item ID
   * @param Key Item ID
   * @param Number weight for this link to be increased on
   */
  _associate (key1, key2, _weight = 0, p = {}) {
    if (!validateKeys(key1, key2)) return []

    let linkedTo1 = this._links[key1]
    let linkedTo2 = this._links[key2]
    let skip
    const weight = _.isInteger(_weight) ? _weight : 0

    if (!linkedTo1) linkedTo1 = this._links[key1] = [] // eslint-disable-line
    if (!linkedTo2) linkedTo2 = this._links[key2] = [] // eslint-disable-line

    // check if link exists and increment weight if it does
    linkedTo1.forEach((_link) => {
      const link = _link
      if (link && link[0] === key2) {
        if (p.overwrite) link[1] = (weight || 0)
        else link[1] = (link[1] || 0) + (weight || 1)
        skip = true
      }
    })
    // write new links
    if (!skip) {
      linkedTo1.push([key2, weight])
      linkedTo2.push([key1, weight])
    }
    linkedTo1.sort(compareWeight)
    linkedTo2.sort(compareWeight)
    return [key1, key2]
  }
  /**
   * unlink two items
   */
  _disassociate (key1, key2) {
    if (!validateKeys(key1, key2)) return []
    this._links[key1] = _.filter(this._links[key1], link => link[0] !== key2)
    this._links[key2] = _.filter(this._links[key2], link => link[0] !== key1)
    return [key1, key2]
  }
  /**
   * Remove link between key1 and each on from keyS
   * TODO accept single argument Array: remove crosslink between each other
   */
  disassociate (key1, keyS) {
    const keys = _.castArray(keyS)
    const changed = _.map(keys, key2 => this._disassociate(key1, key2))
    return _.uniq(_.flatten(changed))
  }
  /**
   * Associate one item to array of items
   */
  associate (key1, keyS, weight, p) {
    const keys = _.castArray(keyS)
    const changed = _.map(keys, key2 => this._associate(key1, key2, weight, p))
    return _.uniq(_.flatten(changed))
  }
  /**
   * @param {String|Array} key1
   * @param {String|Array} key2
   * @return Number|Undefined weight of the link if it exists
   */
  getLink (key1, key2) {
    if (!validateKeys(key1, key2)) return undefined
    const linkedTo1 = this._links[key1]
    for (let i = 0; i < linkedTo1.length; i++) {
      if (linkedTo1[i] && linkedTo1[i][0] === key2) return linkedTo1[i][1] || 0
    }
    return undefined
  }
  /**
   * @return Object in format {a:[[b, 3], [c, 1]], b:[[a, 2], [c,1]], c:[[a,4],[b,1]]}
   */
  getLinksMap () {
    return this._links
  }
  /**
   * @return Object in format {a:{b:3,c:1},b:{a:2,c:1},c:{a:4,b:1}}
   */
  getLinksWeightMap () {
    const map = {}
    _.each(this._links, (links, key) => {
      map[key] = {}
      _.each(links, (link) => { map[key][link[0]] = link[1] })
    })
    return map
  }
  /**
   * @return Array of Links
   */
  getLinksArray () {
    const completed = {}
    const all = []
    _.each(this._links, (linked, key1) => {
      linked.forEach((link) => {
        const key2 = link[0]
        if (!completed[key1] && !completed[key2]) all.push([key1, key2])
      })
      completed[key1] = true
    })
    return all
  }
  /**
   * @param Key Item key
   * @return Array of links of provided Item
   */
  getLinks (key) {
    return this._links[key] || []
  }
  /**
   * @param {String|Array} key Item(s) key
   * @return Array of distinct Items linked with specified Item(s)
   */
  getLinked (key) {
    return _.map(this.getLinks(key), link => link[0])
  }
  /**
   * @param rootKey Key of item to traverse graph from
   * @param depth
   * @return Graph starting from the item(s) provided
   */
  getGraph (rootKeyS, depth = 0) {
    const context = _.cloneDeep(rootKeyS)
    let rootKeys = _.castArray(rootKeyS)
    if (depth > 0) {
      rootKeys = this._getKeysOnDepth(rootKeys, depth)
    }

    const sgItems = {} // sub graph items
    const sgLinks = {}
    _.each(rootKeys, (rootKey) => {
      sgItems[rootKey] = this.get(rootKey)
    })

    // add links in between those retrieved
    _.each(sgItems, (value, sgItemKey) => {
      const allSgItemLinks = this._links[sgItemKey]
      const filteredSgItemLinks = _.filter(allSgItemLinks, link => _.has(sgItems, link[0]))
      sgLinks[sgItemKey] = filteredSgItemLinks
    })

    return new Graph({ context, items: sgItems, links: sgLinks })
  }
  /**
   * @param rootKeys Key of item to traverse graph from
   * @param depth
   * @return Array of keys on depth
   */
  _getKeysOnDepth (rootKeys, depth) {
    const keys = _.cloneDeep(rootKeys)
    for (let i = depth; i > 0; i--) {
      const links = {}
      _.each(keys, (rootKey) => {
        keys.push(rootKey)
        links[rootKey] = this._links[rootKey]
        _.each(links[rootKey], (link) => {
          keys.push(link[0])
        })
      })
    }
    return _.uniq(keys)
  }
  /**
   * Find items linked with each one of specified
   * @param {String|Array} keyS of items connected to the item looked for
   * @return {Array} of keys
   */
  find (keyS) {
    const keys = _.castArray(keyS)
    const arrLinkedKeys = _.map(keys, key => this.getLinked(key))
    return _.intersection(...arrLinkedKeys)
  }

  /**
   * Search linked items for one with value matching the string
   * @param Key key of the item to search children of
   * @param String value should be RegExp, but it cannot be stringified to transfer with JSON
   * @return Graph of Items
   */
  search (_key, lookupValue, p) {
    const resultKeys = []

    const regExp = new RegExp(lookupValue, p)
    _.each(this._links[_key], (key) => {
      if (this.get(key[0]).match(regExp)) resultKeys.push(key[0])
    })
    return resultKeys
  }
  /**
   * ToDo: dijkstra is not defined
   * Utilize dijkstra algorythm
   */
  /* eslint-disable */
  findShortestPath (key1, key2) {
    const map = this.getLinksWeightMap()
    return dijkstra.findShortestPath(map, key1, key2)
  }
  /**
   * @param Function filterer
   * @return Object.Provider new
   */
  filter (filterer) {
    const filteredStorage = new Graph()
    const items = filteredStorage._items = filterKeys(this._items, filterer)
    const fLinks = filteredStorage._links
    _.each(this._links, (links, key) => {
      if (items[key]) {
        fLinks[key] = _.filter(links, (link) => {
          if (items[link[0]]) return link
          return undefined
        })
      }
    })
    return filteredStorage
  }
  /**
   * convert IDs of the object into its values
   */
  log (obj) {
    let str = JSON.stringify(obj)
    str = self._replaceIds(str)
    console.info(str)
    return JSON.parse(str)
  }

  toJSON () {
    return { context: this._context, items: this._items, links: this._links }
  }

  _replaceIds (_str) {
    let recurse = false
    let str = _str

    const ids = str.match(idPattern)
    ids.forEach((id) => {
      const value = self.get(id) || id
      if (_.isArray(value)) recurse = true
      str = str.replace(id, value)
    })
    return recurse ? self._replaceIds(str) : str
  }

  set context (keys) {
    const contextKeys = _.castArray(keys)
    this._context = contextKeys
  }

  get context () {
    return this._context
  }

  getCount () {
    return Object.keys(this._items).length
  }

  _getShortestPath(rootKeyS, key) {
    const path = []
    const coordinatKeys = this._links[key]
    const rootKeys = _.castArray(rootKeyS)
    _.each(rootKeys, (rootKey) => {
      const linkedKeys = this._links[rootKey]
      let intersections = []
      _.each(linkedKeys, (linkedKey) => {
        _.each(coordinatKeys, (coordinatKey) => {
          if(linkedKey[0] === coordinatKey[0]) {
            intersections.push(coordinatKey[0])
            return false
          }
        })
      })

      if(intersections.length !== 0) {
        _.each(intersections, (intersection) => {
          path.push([rootKey, intersection])
        })
      }
    })
    return path
  }

  getGraphWithIntersection(context, depth, keys) {
    const [coordsKey, viewKey] = keys
    const graph = this.getGraph(context, depth)
    const linkedCoords = this.getLink(coordsKey, viewKey)
    const coords = this.getLinked(coordsKey)
    _.each(coords, (coord) => {
      if(linkedCoords == undefined) {
        graph.remove(coord)
      } else if(!linkedCoords.includes(coord)) {
        graph.remove(coord)
      }
    })

    let paths = this._getShortestPath(Object.keys(graph.getItemsMap()), coordsKey)
    paths = _.filter(paths, (path) => {
      if(this.getLink(path[1], viewKey) !== undefined) return true
    })

    _.each(paths, (path) => {
      const data = this.get(path[1])
      graph.set (data, path[1])
      graph.associate(path[1], path[0])
    })

    _.each(paths, (path) => {
      graph.associate(path[1], coordsKey)
    })
    return graph
  }
}
