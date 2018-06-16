/*
 * Raw provider
 * Items consistent FS-based storage
 */
/* eslint no-use-before-define: off */
import _ from 'lodash'
import fs from 'fs-extra'
import Path from 'path'
import glob from 'glob'
import isbinaryfile from 'isbinaryfile'
import Graph from '@graphiy/graph'

const linksDelimiter = '\n'

/**
 * Reads from a directory with files named by their Keys
 * @param String source folder name
 * @return Graph
 */
export function read (source) {
  const obj = { items: {}, links: {} }
  return new Promise((resolve, reject) => {
    let counter = 0
    const files = glob.sync('*', { cwd: source })
    if (files.length === 0) resolve(new Graph)
    _.each(files, (key) => {
      const path = Path.join(source, key)
      _getFile(path)
        .then((data) => {
          const links = JSON.parse(data.linksString)
          obj.items[key] = data.value
          obj.links[key] = links
          if (++counter === files.length) resolve(new Graph(obj))
        })
    })
  })
}
/**
 * Retrieve item
 */
export function get (key, p) {
  const path = Path.join(p.source, key)
  return new Promise((resolve, reject) => {
    _getFile(path, { getBinary: true })
      .then((data) => {
        resolve(data.value)
      })
  })
}
/**
 * Save item
 */
export function set (key, value, links, p) {
  const path = Path.join(p.repository.path, key)
  if ((_.isNil(value) || value === '') && _.isEmpty(links)) {
    try { fs.unlinkSync(path) } catch (e) {}
    return
  }

  let content = value === undefined ? '' : value
  content = JSON.stringify(links) + linksDelimiter + content
  try {
    fs.writeFileSync(path, content)
  } catch (e) { console.error(e) }
}
/**
 * Writes items in one folder with IDs as filenames
 * Start of file contains utf8 encoded string of links Array []
 * @param Graph graph
 */
export function write (graph, p) {
  if (!p.target) {
    console.info('no path specified to write a file')
    return
  }
  _.each(graph.getItemsMap(), (value, key) => {
    const links = graph.getLinks(key)
    set(key, value, links, p)
  })

  console.info(`${_.keys(graph.getItemsMap()).length} Items written`)
}
/**
 * TODO return binary data on getBinary flag
 */
function _getFile (path, p = {}) {
  let linksString = ''
  let value

  return new Promise((resolve, reject) => {
    if (isbinaryfile.sync(path)) {
      const readStream = fs.createReadStream(path, { encoding: 'utf8' })
      readStream.on('data', (chunk) => {
        const endLinksPosition = chunk.indexOf(linksDelimiter)
        if (endLinksPosition > 0) {
          linksString += chunk.slice(0, endLinksPosition + 1)
          // if (p.getBinary) {}
          readStream.close()
          resolve({ linksString })
        } else linksString += chunk
      })
    } else {
      fs.readFile(path, 'utf8', (err, str) => {
        const endLinksPosition = str.indexOf(linksDelimiter)
        linksString += str.slice(0, endLinksPosition)
        value = str.slice(endLinksPosition + 1)
        resolve({ linksString, value })
      })
    }
  })
}
