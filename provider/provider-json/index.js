/**
 * JSON provider - synchronous
 */
import _ from 'lodash'
import Path from 'path'
import inflection from 'inflection'
import Graph from '@graphiy/graph'
/**
 * Import from JSON
 * parse key-value as a group
 * but if value is array just link each value item to key
 * @return Graph
 */
export function read (json) {
  const graph = new Graph
  const rootK = graph.set('<-root->')
  graph.context = rootK

  function set (keyNode, valueNode) {
    if (_.isArray(valueNode)) {
      valueNode.forEach(subValueNode => {
        set(keyNode, subValueNode)
      })
    } else if (_.isPlainObject(valueNode)) {
      _.each(valueNode, (subValueNode, subKeyNode) => {
        set(keyNode, subKeyNode)
        set(subKeyNode, subValueNode)

        // TODO do not set group node value, this is temporary for easy debug
        const groupNode = keyNode + '<-->' + subKeyNode
        set(groupNode, subValueNode)
      })
    } else {
      const keyNodeK = graph.search(rootK, keyNode)[0] || graph.set(keyNode.toString())
      const valueNodeK = graph.search(rootK, valueNode)[0] || graph.set(valueNode.toString())
      graph.associate(rootK, keyNodeK)
      graph.associate(rootK, valueNodeK)
      graph.associate(keyNodeK, valueNodeK)
    }
  }

  _.each(json, (value, key) => {
    set(key, value)
  })

  return graph
}

export function write (graph, p) {
}
