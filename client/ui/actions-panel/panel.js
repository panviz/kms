/**
 * Actions panel control
 */
import Util from '../../../core/util'

export default function Self (p) {
  this.p = p || {}
  this.selectors = {
    panel: '.actions-panel',
    group: '.group',
    action: '.action',
  }
  this.actions = this.p.actions

  const $html = $(G.Templates['ui/actions-panel/panel']())
  this.p.container.append($html)
  this.elements = Util.findElements($html, this.selectors)

  this.actionTemplate = G.Templates['ui/actions-panel/action']
  this.groupTemplate = G.Templates['ui/actions-panel/group']

  _.each(this.actions, function (action) {
    this.addMenuItem(action)
  })
  this.elements.root.on('click', this.selectors.action, this._onMenuItemClick.bind(this))
  this.elements.root.on('click', this.selectors.group, this._onGroupClick.bind(this))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.addMenuItem = function (action) {
  action.on('enable', this.enableMenuItem.bind(this, action))
  action.on('disable', this.disableMenuItem.bind(this, action))
  action.on('show', this.addMenuItem.bind(this, action))
  action.on('hide', this.removeMenuItem.bind(this, action))

  const actionData = {
    id: action.id,
    label: action.getLabel(),
    icon: action.getIcon(),
  }
  const actionHTML = this.actionTemplate(actionData)
  const $actionHTML = $(actionHTML).toggleClass('enabled', action.isEnabled())
  const group = action.group || 'main'
  let $group = this.elements.root.find(`.${group}`)
  if (_.isEmpty($group)) {
    $group = $(this.groupTemplate({ group }))
    this.elements.root.append($group)
  }
  $group.find('ul').append($actionHTML)
  Util.updateElements(this)
}

Self.prototype.removeMenuItem = function (action) {
  const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
  menuItem.remove()
  Util.updateElements(this)
}

Self.prototype.enableMenuItem = function (action) {
  const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
  menuItem.addClass('enabled')
}

Self.prototype.disableMenuItem = function (action) {
  const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
  menuItem.removeClass('enabled')
}

Self.prototype._onMenuItemClick = function (e) {
  e.stopPropagation()
  const data = $(e.target).data()
  const action = this.actions[data.id]
  action.apply(data)
}

Self.prototype._onGroupClick = function (e) {
  const $group = $(e.currentTarget)
  $group.find('ul').slideToggle()
  $group.find('span').toggleClass('collapsed')
}
