/**
 * Operates on ids of data items
 * @event change fires on items collection changed
 */
var Util = require('../../core/util')

var Self = function Selection(p) {
  var self = this
  self._items = []

}
BackboneEvents.mixin(Self.prototype)
/**
 * @param selection Id or Array
 */
Self.prototype.add = function (selection) {
  var self = this
  selection = _.without(Util.pluralize(selection), undefined)
  if (_.isEmpty(selection)) return
  // Do not add existing items
  if (_.isEmpty(_.difference(selection, self._items))) return

  self._items = _.union(self._items, selection)

  self.trigger('change', selection)
}

Self.prototype.get = function (id) {
  var self = this
  if (id !== undefined) {
    return self._items.indexOf(id) > -1
  } else {
    return self._items
  }
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
