/**
 * UI control class
 */
import Util from '../../core/util'
import Actionman from './actionman'
import GraphView from '../view/graph/graph'
import ListView from '../view/list/list'
import Editor from '../view/editor/editor'
import Menu from './main-menu/menu'
import ActionsPanel from './actions-panel/panel'

const _actions = [
  /* eslint-disable */
  require('../action/select/none').default,
  require('../action/select/invert').default,
  require('../action/select/children').default,
  require('../action/item/create').default,
  require('../action/item/edit').default,
  require('../action/item/save').default,
  require('../action/item/link').default,
  require('../action/item/unlink').default,
  require('../action/item/expand').default,
  require('../action/item/hide').default,
  require('../action/item/remove').default,
  /* eslint-enable */
]

export default class UI {
  constructor (p = {}) {
    this.actionman = new Actionman()
    this.p = p
    this.selection = p.selection

    this.elements = Util.findElements('body', this.selectors)

    const graphViewSet = {
      actionman: this.actionman,
      container: this.elements.viewContainer,
      selection: this.selection,
    }
    const listViewSet = {
      actionman: this.actionman,
      container: this.elements.viewContainer,
      selection: this.selection,
      hidden: true,
    }
    const editorSet = {
      actionman: this.actionman,
      container: this.elements.viewContainer,
      selection: this.selection,
      hidden: true,
    }

    this.graphView = new GraphView(graphViewSet)

    this.linkedList = new ListView(listViewSet)
    this.linkedList.on('show', this._layoutViews.bind(this))
    this.linkedList.on('hide', this._layoutViews.bind(this))
    this.linkedList.on('toogleSize', this._toogleViewsSize.bind(this))

    this.editor = new Editor(editorSet)
    this.editor.on('hide', () => {
      this.actionman.get('itemSave').apply()
    })
    this.editor.on('show', this._layoutViews.bind(this))
    this.editor.on('hide', this._layoutViews.bind(this))
    this.editor.on('toogleSize', this._toogleViewsSize.bind(this))

    this.actionsPanel = new ActionsPanel({
      container: this.elements.sidebar,
      actions: this.actionman.getAll(),
    })
    this.actionman.on('add', this.actionsPanel.addMenuItem.bind(this.actionsPanel))
    this.menu = new Menu({ container: this.elements.header })

    this.actions = _actions
    setTimeout(() => {
      _.each(this.actions, action => this.actionman.set(action, this.p.itemman))
    })
  }

  get selectors () {
    return {
      header: 'header',
      container: '.container',
      sidebar: '.sidebar',
      viewContainer: '.view-container',
    }
  }
  /**
   * Hide secondary views on empty selection
   */
  hideSecondaryViews () {
    this.editor.hide()
    this.linkedList.hide()
  }

  _layoutViews () {
    this.graphView.resize()
  }

  _toogleViewsSize (target) {
    $(target).closest('.view').toggleClass('max min')
  }
}
