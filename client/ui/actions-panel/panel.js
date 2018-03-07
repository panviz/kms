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
    this.actionman = p.actionman
    this.menuConfig = {
      SelectNone: {
        label: 'none',
          icon: 'fa fa-ban',
          group: 'select',
      },
      Invert: {
        label: 'Invert',
          icon: 'mdi mdi-invert-colors',
          group: 'select',
      },
      SelectChildren: {
        label: 'Children',
          icon: 'mdi mdi-chemical-weapon',
          group: 'select',
      },
      Create: {
        group: 'item',
        subaction: [
          {
            label: 'Create note',
            icon: 'mdi mdi-note-outline',
            sub: 'note',
          },
          {
            label: 'Create tag',
            icon: 'mdi mdi-tag-outline',
            sub: 'tag',
          },
        ],
      },
      Link: {
        label: 'Link',
        icon: 'mdi mdi-link-variant',
        group: 'item',
      },
      Unlink: {
        label: 'Unlink',
          icon: 'mdi mdi-link-variant-off',
          group: 'item',
      },
      Expand: {
        label: 'Show Children',
          icon: 'mdi mdi-sitemap',
          group: 'item',
      },
      Remove: {
        label: 'Delete',
          icon: 'fa fa-remove',
          group: 'item',
      },
    }

    const $html = $(template())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

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
    action.on('state:change', this.toggleItemStatus.bind(this, action))
    action.on('show', this.addMenuItem.bind(this, action))
    action.on('hide', this.removeMenuItem.bind(this, action))
    const config = _.assign({ id: action.id }, this.menuConfig[action.id])


    const actionHTML = actionTemplate(config)
    const $actionHTML = $(actionHTML).toggleClass('enabled', action.isEnabled)
    if (!_.isEmpty(action.submenu)) {
      $actionHTML.find('.sub-button').toggleClass('enabled', action.isEnabled)
    }
    const group = this.menuConfig[action.id].group || 'main'
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

  toggleItemStatus (action, deny) {
    if (deny) {
      this.enableMenuItem(action)
    } else {
      this.disableMenuItem(action)
    }
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
    const { id } = data
    this.actionman.fire(id, 'all', data)
  }

  _onGroupClick (e) {
    const $group = $(e.currentTarget)
    $group.find('ul').slideToggle()
    $group.find('span').toggleClass('collapsed')
  }

  update (selection) {
    _.forIn(this.actionman.getAll(), (instance) => {
      const registrars = this.actionman.getRegistrars(instance.id)
      instance.evaluate(registrars.app, selection)
    })
  }
}
