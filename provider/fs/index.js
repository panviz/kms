/**
 * File System provider
 * Can read arbitrary directory tree
 * TODO? Consider same name tags in different paths as the same tag
 */
import _ from 'lodash'
import fs from 'fs-extra'
import Path from 'path'
import glob from 'glob'
import Graph from '../graph/index'
import isbinaryfile from 'isbinaryfile'

export default function FS (p = {}) {
  this.p = p
  this.storage = new Graph()
}
/**
  find duplicates
  parse path to have grouped parts
  create Item per every folder name
  create Groups
  connect Group with children
  connect folder name (with groups) with each other
*/
FS.prototype.read = function () {
  this.inDir = Path.normalize(this.p.source || '.')
  this.outDir = Path.normalize(this.p.target || '.')
  const files = glob.sync(Path.join(this.inDir, '**/*'))
  console.info(`${files.length} paths read`)

  this.tagPaths = {}
  this.items = {}
  this.duplicates = {}
  this.tagIds = {}

  files.forEach(this.findTagDuplicates.bind(this))
  files.forEach(this.parse.bind(this))
  // console.log(this.duplicates);
  // console.log(_.keys(this.duplicates).sort())
  return this.storage
}

FS.prototype.findTagDuplicates = function (path) {
  const relative = Path.relative(this.inDir, path)
  const names = this._getTagsFromPath(path)

  const last = _.last(names)
  if (this.tagPaths[last]) {
    if (!this.duplicates[last]) this.duplicates[last] = []
    if (!_.contains(this.duplicates[last], this.tagPaths[last])) {
      this.duplicates[last].push(this.tagPaths[last])
    }
    this.duplicates[last].push(relative)
  }
  this.tagPaths[last] = relative
}

FS.prototype.parse = function (path) {
  const names = this._getTagsFromPath(path)
  const items = []

  names.forEach((name, index) => {
    // Disable Groups for development simplicity
    // skip folders in the root for composing Groups
    // if (index > 0 && _.contains(_.keys(this.duplicates), name)) {
      // items[items.length -1] = [items[items.length -1], name]
    // } else
    items.push(name)
  })

  // add text content
  if (!fs.lstatSync(path).isDirectory()) {
    const doParsing = isbinaryfile(path) || this.p.noTextParsing
    const content = doParsing ? path : fs.readFileSync(path, 'utf8')
    if (content !== '') items.push(content)
  }

  this.parseSequence(items)
}
// Link parent-child
FS.prototype.parseSequence = function (items) {
  items.forEach((item, index) => {
    if (_.isArray(item)) {
      const groupedIds = this.parseGroup(item)
      const groupId = this.storage.setUniq(groupedIds)
      this.tagIds[groupId] = groupId

      // replace array with ID
      items[index] = groupId
    } else {
      this.tagIds[item] = this.storage.setUniq(item)
    }

    // Link parent-child folders
    if (items[index - 1]) {
      this.storage.associate(this.tagIds[items[index]], this.tagIds[items[index - 1]])
    }
  })
}
/**
 * save grouped Items
 * @returns Array grouped Items ids
 */
FS.prototype.parseGroup = function (items) {
  const groupedItemIds = []
  items.forEach((item, index) => {
    this.tagIds[item] = this.storage.setUniq(item)
    groupedItemIds.push(this.tagIds[item])
  })
  return groupedItemIds
}

FS.prototype._getTagsFromPath = function (path) {
  let relative = Path.relative(this.inDir, path)
  // ignore file extension
  if (!fs.lstatSync(path).isDirectory()) {
    relative = relative.replace(Path.extname(path), '')
  }
  let tags = relative.split(/[\\\/\.]+/)
  if (_.isArray(this.p.ignore)) tags = _.difference(tags, this.p.ignore)
  if (this.p.root) tags.unshift(this.p.root)
  return tags
}
