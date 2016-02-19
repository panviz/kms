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

  self.actionTemplate = G.Templates['ui/actions-panel/action']

  _.each(self.actions, function (action) {
    self.addMenuItem(action)
    action.on('enable', self.enableMenuItem.bind(self, action))
    action.on('disable', self.disableMenuItem.bind(self, action))
    action.on('show', self.addMenuItem.bind(self, action))
    action.on('hide', self.removeMenuItem.bind(self, action))
  })
  self.elements = Util.findElements(self.p.container, self.selectors)
  self.elements.list.on('click', self.selectors.action, self._onMenuItemClick.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype._onMenuItemClick = function (e) {
  var self = this
  var data = $(e.target).data()
  var action = self.actions[data.id]
  action.apply(data)
}

Self.prototype.addMenuItem = function (action) {
  var self = this
  var actionData = {
    id: action.id,
    label: action.getLabel(),
    icon: action.getIcon(),
  }
  var html = self.actionTemplate(actionData)
  var $html = $(html).toggleClass('enabled', action.isEnabled())
  self.elements.list.append($html)
}

Self.prototype.removeMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.list.find('[data-id="' + action.id + '"]')
  menuItem.remove()
}

Self.prototype.enableMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.list.find('[data-id="' + action.id + '"]')
  menuItem.addClass('enabled')
}

Self.prototype.disableMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.list.find('[data-id="' + action.id + '"]')
  menuItem.removeClass('enabled')
}

module.exports = Self
