/**
 * CSV provider
 */
import _ from 'lodash'
import csv from 'csv'
import Graph from '../graph/index'

export default function CSV (p = {}) {}
/**
 * parse each line as Item
 */
CSV.prototype.read = function (source, p) {
  const graph = new Graph

  return new Promise((resolve, reject) => {
    const root = graph.set()

    csv.parse(source, (err, rows) => {
      const headers = rows.shift()
      const titles = _.map(headers, header => graph.set(header))

      rows.forEach((row) => {
        const rowItem = graph.set()
        _.each(row, (value, index) => {
          if (!value) return
          const valueKey = graph.set(value)
          graph.associate(valueKey, titles[index])
          graph.associate(valueKey, rowItem)
        })
        graph.associate(rowItem, root)
      })
      resolve(graph)
    })
  })
}

CSV.prototype.write = function () {
}
