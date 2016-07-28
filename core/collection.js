/**
 * Collection object
 * Operates on ids of data items
 * @event add fires on items added to collection
 * @event remove fires on items removed from collection
 * @event change fires on items collection changed
 */
import _ from 'lodash'
import BackboneEvents from 'backbone-events-standalone'
import Util from '../core/util'

export default function Self (p) {
  this._items = []
}
BackboneEvents.mixin(Self.prototype)
/**
 * @param {ID or Array} items
 */
Self.prototype.add = function (itemS) {
  let items = Util.pluralize(itemS)
  // Do not add existing items and non String values
  items = _.filter(items, item => _.isString(item) && item && !_.includes(this._items, item))
  if (_.isEmpty(items)) return []

  this._items = _.union(this._items, items)

  this.trigger('add', items)
  this.trigger('change', items)
  return items
}

Self.prototype.get = function (id) {
  return this._items.indexOf(id) > -1
}

Self.prototype.getAll = function () {
  return _.clone(this._items)
}

Self.prototype.getCount = function () {
  return this._items.length
}

Self.prototype.remove = function (itemS) {
  let items = Util.pluralize(itemS)
  items = _.filter(items, item => _.isString(item) && item && _.includes(this._items, item))
  if (_.isEmpty(items)) return []

  this._items = _.difference(this._items, items)

  this.trigger('remove', items)
  this.trigger('change', items)
  return items
}

Self.prototype.clear = function () {
  if (_.isEmpty(this._items)) return []

  const removed = this._items
  this._items = []

  this.trigger('remove', removed)
  this.trigger('change', removed)
  return removed
}
