/**
 * Collection object
 * Operates on ids of data items
 * @event add fires on items added to collection
 * @event remove fires on items removed from collection
 * @event change fires on items collection changed
 */
var Util = require('../core/util')

var Self = function (p) {
  var self = this
  self._items = []
}
BackboneEvents.mixin(Self.prototype)
/**
 * @param {ID or Array} items 
 */
Self.prototype.add = function (items) {
  var self = this
  items = Util.pluralize(items)

  // Do not add existing items and non String values
  items = _.filter(items, function (item) {
    return _.isString(item) && item && !_.includes(self._items, item)
  })
  if (_.isEmpty(items)) return []

  self._items = _.union(self._items, items)

  self.trigger('add', items)
  self.trigger('change', items)
  return items
}

Self.prototype.get = function (id) {
  var self = this
  return self._items.indexOf(id) > -1
}

Self.prototype.getAll = function () {
  return _.clone(this._items)
}

Self.prototype.getCount = function () {
  var self = this
  return self._items.length
}

Self.prototype.remove = function (items) {
  var self = this
  items = Util.pluralize(items)

  items = _.filter(items, function (item) {
    return _.isString(item) && item && _.includes(self._items, item)
  })
  if (_.isEmpty(items)) return []

  self._items = _.difference(self._items, items)

  self.trigger('remove', items)
  self.trigger('change', items)
  return items
}

Self.prototype.clear = function () {
  var self = this
  if (_.isEmpty(self._items)) return

  var removed = self._items
  self._items = []

  self.trigger('remove', removed)
  self.trigger('change', removed)
  return removed
}

module.exports = Self
