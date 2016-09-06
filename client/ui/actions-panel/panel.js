/**
 * Actions panel control
 */
import Util from '../../../core/util'

export default class Self extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
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

  addMenuItem (action) {
    action.on('enable', this.enableMenuItem.bind(this, action))
    action.on('disable', this.disableMenuItem.bind(this, action))
    action.on('show', this.addMenuItem.bind(this, action))
    action.on('hide', this.removeMenuItem.bind(this, action))

    const actionHTML = this.actionTemplate(action)
    const $actionHTML = $(actionHTML).toggleClass('enabled', action.isEnabled())
    const group = action.group || 'main'
    let $group = this.elements.root.find(`.${group}`)
    if (_.isEmpty($group)) {
      $group = $(this.groupTemplate({ group }))
      this.elements.root.append($group)
    }
    $group.find('.actions').append($actionHTML)
    Util.updateElements(this)
  }

  removeMenuItem (action) {
    const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
    menuItem.remove()
    Util.updateElements(this)
  }

  enableMenuItem (action) {
    const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
    menuItem.addClass('enabled')
  }

  disableMenuItem (action) {
    const menuItem = this.elements.root.find(`[data-id="${action.id}"]`)
    menuItem.removeClass('enabled')
  }

  _onMenuItemClick (e) {
    e.stopPropagation()
    const data = $(e.currentTarget).data()
    const action = this.actions[data.id]
    action.apply(data)
  }

  _onGroupClick (e) {
    const $group = $(e.currentTarget)
    $group.find('ul').slideToggle()
    $group.find('span').toggleClass('collapsed')
  }
}
