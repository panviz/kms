/**
 * Actions panel control
 */
import EventEmitter from 'eventemitter3'
import Util from '../../../core/util'
import template from './panel.html'
import groupTemplate from './group.html'
import actionTemplate from './action.html'
import './panel.scss'

export default class ActionsPanel extends EventEmitter {
  constructor (p = {}) {
    super()
    this.p = p
    this._selection = p.selection
    this.actions = this.p.actions

    const $html = $(template())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

    _.each(this.actions, function (action) {
      this.addMenuItem(action)
    })
    this.elements.root.on('click', this.selectors.action, this._onMenuItemClick.bind(this))
    this.elements.root.on('click', this.selectors.group, this._onGroupClick.bind(this))
  }

  get selectors () {
    return {
      panel: '.actions-panel',
      group: '.group',
      action: '.action',
    }
  }

  addMenuItem (action) {
    action.on('enable', this.enableMenuItem.bind(this, action))
    action.on('disable', this.disableMenuItem.bind(this, action))
    action.on('show', this.addMenuItem.bind(this, action))
    action.on('hide', this.removeMenuItem.bind(this, action))

    const actionHTML = actionTemplate(action)
    const $actionHTML = $(actionHTML).toggleClass('enabled', action.isEnabled())
    if (!_.isEmpty(action.submenu)) {
      $actionHTML.find('.sub-button').toggleClass('enabled', action.isEnabled())
    }
    const group = action.group || 'main'
    let $group = this.elements.root.find(`.${group}`)
    if (_.isEmpty($group)) {
      $group = $(groupTemplate({ group }))
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
    action.apply(data, this._selection)
  }

  _onGroupClick (e) {
    const $group = $(e.currentTarget)
    $group.find('ul').slideToggle()
    $group.find('span').toggleClass('collapsed')
  }

  update (selection) {
    _.each(this.actions, (action) => {
      action.evaluate(selection)
    })
  }
}
