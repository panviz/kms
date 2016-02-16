/**
 * Operates on ids of data items
 * @event add fires on items added to collection
 * @event remove fires on items removed from collection
 * @event change fires on items collection changed
 */
var Util = require('../../core/util')

var Self = function Selection(p) {
  var self = this
  self._items = []
}
BackboneEvents.mixin(Self.prototype)
/**
 * @param {ID or Array} items 
 */
Self.prototype.add = function (items) {
  var self = this
  items = _.without(Util.pluralize(items), undefined)
  if (_.isEmpty(items)) return
  // Do not add existing items
  if (_.isEmpty(_.difference(items, self._items))) return

  self._items = _.union(self._items, items)

  self.trigger('add', items)
  self.trigger('change', items)
}

Self.prototype.get = function (id) {
  var self = this
  var position = self._items.indexOf(id) > -1
  return self._items[position]
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
  if (!_.isArray(items)) items = [items]
  if (_.isEmpty(items)) return

  self._items = _.difference(self._items, items)

  self.trigger('remove', items)
  self.trigger('change', items)
}

Self.prototype.clear = function () {
  var self = this
  if (_.isEmpty(self._items)) return

  var deselected = self._items
  self._items = []

  self.trigger('change', deselected)
}

module.exports = Self
