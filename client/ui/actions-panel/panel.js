/**
 * Actions panel control
 */
var Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    panel: '.actions-panel',
    group: '.group',
    action: '.action',
  }
  self.actions = self.p.actions

  var $html = $(G.Templates['ui/actions-panel/panel']())
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)

  self.actionTemplate = G.Templates['ui/actions-panel/action']
  self.groupTemplate = G.Templates['ui/actions-panel/group']

  _.each(self.actions, function (action) {
    self.addMenuItem(action)
  })
  self.elements.root.on('click', self.selectors.action, self._onMenuItemClick.bind(self))
  self.elements.root.on('click', self.selectors.group, self._onGroupClick.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.addMenuItem = function (action) {
  var self = this
  action.on('enable', self.enableMenuItem.bind(self, action))
  action.on('disable', self.disableMenuItem.bind(self, action))
  action.on('show', self.addMenuItem.bind(self, action))
  action.on('hide', self.removeMenuItem.bind(self, action))

  var actionData = {
    id: action.id,
    label: action.getLabel(),
    icon: action.getIcon(),
  }
  var actionHTML = self.actionTemplate(actionData)
  var $actionHTML = $(actionHTML).toggleClass('enabled', action.isEnabled())
  var group = action.group || 'main'
  var $group = self.elements.root.find('.' + group)
  if (_.isEmpty($group)) {
    var $group = $(self.groupTemplate({group: group}))
    self.elements.root.append($group)
  }
  $group.find('ul').append($actionHTML)
  Util.updateElements(self)
}

Self.prototype.removeMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.root.find('[data-id="' + action.id + '"]')
  menuItem.remove()
  Util.updateElements(self)
}

Self.prototype.enableMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.root.find('[data-id="' + action.id + '"]')
  menuItem.addClass('enabled')
}

Self.prototype.disableMenuItem = function (action) {
  var self = this
  var menuItem = self.elements.root.find('[data-id="' + action.id + '"]')
  menuItem.removeClass('enabled')
}

Self.prototype._onMenuItemClick = function (e) {
  var self = this
  var data = $(e.target).data()
  var action = self.actions[data.id]
  action.apply(data)
}

Self.prototype._onGroupClick = function (e) {
  var self = this
  var $group = $(e.currentTarget)
  $group.find('ul').slideToggle()
  $group.find('span').toggleClass('collapsed')
}

module.exports = Self
