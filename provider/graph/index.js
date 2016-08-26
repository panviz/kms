/**
 * Graph provider - In memory Associative storage
 *
 * Basic module which is used by many others as operational in-memory (temporary) storage
 * Links are stored in redundant format: each item's key has array of its links
 * Link is an array of key and weight
 * Binary Items are only referenced by path
 */
import _ from 'lodash'
import dijkstra from '../../core/dijkstra'
import Util from '../../core/util'

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
function generateID (a) {
  if (a) return (a ^ Math.random() * 16 >> a / 4).toString(16)
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateID)
}

const idPattern = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/g

export default function Self (obj = {}) {
  this.providerID = 'graph'
  this._items = _.cloneDeep(obj.items) || {}
  this._links = _.cloneDeep(obj.links) || {}
}
/**
 * Doesn't allow override except if key is specified exactly
 * @param {String|Array} data values of items to be set
 * @param Key key of the item to set data to
 * @return Key ID for existing item if any
 */
Self.prototype.set = function (_data, _key) {
  let key = _key
  let data = _data
  if (_.isArray(data)) return _.map(data, (datum) => this.set(datum))

  if (data === '' || _.isNil(data)) {
    if (key && _.isEmpty(this.getLinks(key))) return this.remove(key)
    key = key || generateID()

    // Ensure value is not undefined, as JSON stringify will omit it
    data = ''
  } else {
    key = key || this.getKey(data) || generateID()
  }
  this._items[key] = data
  return key
}
/**
 * remove key, value, its links and its key from all item which links to it
 */
Self.prototype.remove = function (keyS) {
  const keys = Util.pluralize(keyS)
  const changed = _.map(keys, this._remove.bind(this))
  return _.union(...changed)
}

Self.prototype._remove = function (key) {
  const linkedKeys = this.getLinked(key)
  _.each(linkedKeys, (linkedKey) => { this.setDisassociate(key, linkedKey) })
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
Self.prototype.complement = function (graph) {
  this.merge(graph, { overwrite: false })
}
/**
 * Merge this with provided graph
 * overwrite existing values and links weights
 * links are summed
 * @param Graph graph
 * @param Boolean p.overwrite existing items values with provided
 */
Self.prototype.merge = function (graph, p = { overwrite: true }) {
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
 * DEPRECATED
 * Create Group Item and link with children
 * @param String groupValue
 * @param data Array values of items to be connected to the group item
 */
Self.prototype.setGroup = function (groupValue, data) {
  const noData = !data || _.isEmpty(data)
  if (!groupValue && noData) throw new Error('empty item with no links')
  if (noData) return this.set(groupValue)

  const key = this.set(groupValue)
  const groupKeys = _.map(data, datum => this.set(datum))
  this.associate(key, groupKeys)

  return key
}
/**
 * @param Key Item ID
 * @return String Item data
 */
Self.prototype.get = function (key) {
  return this._items[key]
}
/**
 * @return Object all stored items
 */
Self.prototype.getItemsMap = function () {
  return this._items
}
/**
 * @return Array of keys
 */
Self.prototype.getItemKeys = function () {
  return _.keys(this._items)
}
/**
 * Get key of item by value
 * do not return anything by empty value
 * @param String data of Item
 * @return Key of Item
 */
Self.prototype.getKey = function (_value) {
  if (!_value) return ''
  const value = _value.toString()

  return _.invert(this._items)[value]
}
/**
 * DEPRECATED
 * @param String data
 * @return Key of Item with group meaning
 */
Self.prototype.findGroup = function (data) {
  if (!_.isArray(data)) throw new Error('Group can be found by multiple values only')
  const keys = _.map(data, datum => this.getKey(datum))
  return this.getKey(keys)
}
/**
 * Create link between two Items
 * Item may be absent in graph. This is useful for referencing items in other graphs/providers
 * @param Key Item ID
 * @param Key Item ID
 * @param Number weight for this link to be increased on
 */
Self.prototype._associate = function (key1, key2, _weight = 0, p = {}) {
  if (!this.validateKeys(key1, key2)) return []

  let linkedTo1 = this._links[key1]
  let linkedTo2 = this._links[key2]
  let skip
  const weight = _.isInteger(_weight) ? _weight : 0

  if (!linkedTo1) linkedTo1 = this._links[key1] = []
  if (!linkedTo2) linkedTo2 = this._links[key2] = []

  // check if link exists and increment weight if it does
  linkedTo1.forEach((_link) => {
    const link = _link
    if (link && link[0] === key2) {
      if (p.overwrite) link[1] = (weight || 0)
      else link[1] = (link[1] || 0) + (weight || 1)
      skip = true
      return
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
Self.prototype._disassociate = function (key1, key2) {
  if (!this.validateKeys(key1, key2)) return []
  this._links[key1] = _.filter(this._links[key1], link => link[0] !== key2)
  this._links[key2] = _.filter(this._links[key2], link => link[0] !== key1)
  return [key1, key2]
}
/**
 * TODO accept single argument Array: remove crosslink between each other
 */
Self.prototype.setDisassociate = function (key1, keyS) {
  const keys = Util.pluralize(keyS)
  const changed = _.map(keys, (key2) => this._disassociate(key1, key2))
  return _.uniq(_.flatten(changed))
}
/**
 * Associate one item to array of items
 */
Self.prototype.associate = function (key1, keyS, weight, p) {
  const keys = Util.pluralize(keyS)
  const changed = _.map(keys, (key2) => this._associate(key1, key2, weight, p))
  return _.uniq(_.flatten(changed))
}
/**
 * @param {String|Array} key1
 * @param {String|Array} key2
 * @return Number|Undefined weight of the link if it exists
 */
Self.prototype.getLink = function (key1, key2) {
  if (!this.validateKeys(key1, key2)) return undefined
  const linkedTo1 = this._links[key1]
  for (let i = 0; i < linkedTo1.length; i++) {
    if (linkedTo1[i] && linkedTo1[i][0] === key2) return linkedTo1[i][1] || 0
  }
  return undefined
}
/**
 * @return Object in format {a:[[b, 3], [c, 1]], b:[[a, 2], [c,1]], c:[[a,4],[b,1]]}
 */
Self.prototype.getLinksMap = function () {
  return this._links
}
/**
 * @return Object in format {a:{b:3,c:1},b:{a:2,c:1},c:{a:4,b:1}}
 */
Self.prototype.getLinksWeightMap = function () {
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
Self.prototype.getLinksArray = function () {
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
Self.prototype.getLinks = function (key) {
  return this._links[key] || []
}
/**
 * @param {String|Array} key Item(s) key
 * @return Array of distinct Items linked with specified Item(s)
 */
Self.prototype.getLinked = function (key) {
  return _.map(this.getLinks(key), (link) => link[0])
}
/**
 * TODO works only for depth 0/1
 * @param rootKey Key of item to traverse graph from
 * @param depth
 * @return Graph starting from the item provided
 */
Self.prototype.getGraph = function (rootKeyS, depth = 0) {
  const sgItems = {} // sub graph items
  const sgLinks = {}
  const rootKeys = Util.pluralize(rootKeyS)
  _.each(rootKeys, (rootKey) => {
    sgItems[rootKey] = this.get(rootKey)

    if (depth === 1) {
      sgLinks[rootKey] = this._links[rootKey]
      // get values of first-level linked items
      _.each(sgLinks[rootKey], (link) => {
        sgItems[link[0]] = this.get(link[0])
      })
    }
  })

  // add links in between those retrieved
  _.each(sgItems, (value, sgItemKey) => {
    const allSgItemLinks = this._links[sgItemKey]
    const filteredSgItemLinks = _.filter(allSgItemLinks, link => _.has(sgItems, link[0]))
    sgLinks[sgItemKey] = filteredSgItemLinks
  })

  return new Self({ items: sgItems, links: sgLinks })
}
/**
 * Find items linked with each one of specified
 * @param {String|Array} Keys of items connected to the item looked for
 */
Self.prototype.findByKeys = function (keyS) {
  const keys = Util.pluralize(keyS)
  const arrLinkedKeys = _.map(keys, key => this.getLinked(key))
  return _.intersection(...arrLinkedKeys)
}
/** convenient way to find by values
 * @param {String|Array} values of items connected to the item looked for
 */
Self.prototype.findByValues = function (valueS) {
  const values = Util.pluralize(valueS)
  const keys = _.map(values, value => this.getKey(value))
  return this.findByKeys(keys)
}
// find by values or keys
Self.prototype.findByLinks = function (datumS) {
  const data = Util.pluralize(datumS)

  const keys = _.map(data, (datum) => {
    const key = datum.match(idPattern) ? datum : this.getKey(datum)
    return key
  })

  return this.findByKeys(keys)
}
/**
 * Find item with value matching the string
 * @param String value should be RegExp, but it cannot be stringified to transfer with JSON
 * @return Graph of Items
 */
Self.prototype.find = function (lookupValue, p) {
  const resultKeys = []
  const existing = this.getKey(lookupValue)
  if (existing) return existing

  const regExp = new RegExp(lookupValue, p)
  _.each(this._items, (value, key) => {
    if (value.match(regExp)) resultKeys.push(key)
  })
  return resultKeys
}
/**
 * Utilize dijkstra algorythm
 */
Self.prototype.findShortestPath = function (key1, key2) {
  const map = this.getLinksWeightMap()
  return dijkstra.findShortestPath(map, key1, key2)
}
/**
 * @param Function filterer
 * @return Object.Provider new
 */
Self.prototype.filter = function (filterer) {
  const filteredStorage = new Self()
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
 * @param Function func to be called with arguments (values instead of keys)
 */
Self.prototype.guess = function (func, ...args) {
  const keys = _.map(args, arg => self.getKey(arg))
  const result = func(...keys)
  return self.log(result)
}
/**
 * convert IDs of the object into its values
 */
Self.prototype.log = function (obj) {
  let str = JSON.stringify(obj)
  str = self._replaceIds(str)
  console.info(str)
  return JSON.parse(str)
}

Self.prototype.toJSON = function () {
  return { items: this._items, links: this._links }
}

Self.prototype._replaceIds = function (_str) {
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
/**
 * do not allow self reference
 */
Self.prototype.validateKeys = function (key1, key2) {
  return key1 && key2 && key1 !== key2
}
