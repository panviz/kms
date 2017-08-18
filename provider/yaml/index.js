/**
  YAML provider - synchronous
  **human editable** yaml formatted text
  May be used for text only. Appropriate for tags export
 */
import _ from 'lodash'
import Path from 'path'
import yaml from 'js-yaml'
import inflection from 'inflection'
import Graph from '../graph/index'

export default function YAML (p = {}) {
  this.p = p
}
/**
 * Import from yaml formatted string
 * parse yaml key-value as a group
 * but if value is array just link each value item to key
 * @return Graph
 */
YAML.prototype.read = function (str) {
  const graph = new Graph

  const data = yaml.load(str)
  // TODO is there a need to create root item?
  const item = graph.set('')
  _.each(data, (datum2, datum1) => {
    if (!datum1 || !datum2) return
    let key1
    let key2
    let groupK
    key1 = graph.set(datum1)

    if (!_.isArray(datum2)) {
      key2 = graph.set(datum2)
      groupK = graph.set()
      graph.associate(groupK, [key1, key2])
      graph.associate(item, groupK)
    } else {
      key1 = graph.set(inflection.singularize(datum1))
      datum2.forEach((arrayDatum) => {
        key2 = graph.set(arrayDatum)
        groupK = graph.set()
        graph.associate(groupK, [key1, key2])
        graph.associate(item, groupK)
      })
    }
  })
  return graph
}
// TODO use native yaml linking feature to not duplicate content
YAML.prototype.write = function (graph) {
  if (!this.p.target) console.info('no path specified to write a file')
  else if (!this.p.target.match('yml')) this.p.target = Path.join(this.p.target, 'data.yml')
  const items = {}

  const unlinked = _.difference(_.keys(graph.getItems()), _.keys(graph.getLinksWeightMap()))
  unlinked.forEach((item) => {
    items[item] = graph.get(item)
  })
  graph.getLinksArray().forEach((link) => {
    const item1 = graph.get(link[0]) || link[0]
    const item2 = graph.get(link[1]) || link[1]

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  console.info(`${_.keys(graph.getItems()).length} Items to write`)
  const yml = yaml.dump(items)
  return yml
}
