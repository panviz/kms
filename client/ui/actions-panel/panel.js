/**
 * Actions panel control
 */
var Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    panel: '.actions-panel',
    list: '.actions-list',
    action: '.action',
  }
  self.actions = self.p.actions

  var $html = $(G.Templates['ui/actions-panel/panel']())
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)

  var actionTemplate = G.Templates['ui/actions-panel/action']

  _.each(self.actions, function (action, id) {
    var actionData = {
      id: action.id,
      label: action.getLabel(),
    }
    var html = actionTemplate(actionData)
    var $html = $(html).toggleClass('enabled', action.isEnabled())
    self.elements.list.append($html)

    action.on('enable', self.enableMenuItem.bind(self, action))
    action.on('disable', self.disableMenuItem.bind(self, action))
  })
  self.elements = Util.findElements(self.p.container, self.selectors)
  self.elements.action.on('click', self._onActionClick.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype._onActionClick = function (e) {
  var self = this
  var data = $(e.target).data()
  var action = self.actions[data.id]
  action.apply(data)
}

Self.prototype.enableMenuItem = function (action) {
  var action = this
  var menuItem = self.list.find(action.id)
  menuItem.removeClass('disabled')
  menuItem.html(action.getLabel())
}

Self.prototype.disableMenuItem = function (action) {
  var self = this
  var menuItem = self.list.find(action.id)
  menuItem.addClass('disabled')
}

module.exports = Self
