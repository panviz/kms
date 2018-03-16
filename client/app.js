/**
 * Client application is run in browser
 */
import { Actionman } from '@graphiy/actionman'
import Util from '../core/util'
import Itemman from './ui/itemman'
import GraphView from './view/graph/graph'
import Menu from './ui/main-menu/menu'
import ActionsPanel from './ui/actions-panel/panel'
import './style/index.scss'

const _actions = [
  /* eslint-disable */
  require('./action/select/none').default,
  require('./action/select/invert').default,
  require('./action/select/children').default,
  require('./action/item/create').default,
  // require('./action/item/edit').default,
  // require('./action/item/save').default,
  require('./action/item/link').default,
  require('./action/item/unlink').default,
  require('./action/item/expand').default,
  // require('./action/item/hide').default,
  require('./action/item/remove').default,
  /* eslint-enable */
]

export default class App {
  constructor () {
    this.id = 'app'
    this.views = {}
    this.actionman = new Actionman()
    this.itemman = new Itemman({ app: this })
    this.itemman.on('updateView', this._updateView.bind(this))

    this.elements = Util.findElements('body', this.selectors)

    const graphViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.viewContainer,
    }

    this.itemman._loadRepo()

    this.actionsPanel = new ActionsPanel({
      container: this.elements.sidebar,
      actionman: this.actionman,
    })

    this._createView('view1', graphViewSet)
    this._createView('view2', graphViewSet)

    this.actionman.on('add', this.actionsPanel.addMenuItem.bind(this.actionsPanel))
    this.menu = new Menu({ container: this.elements.header })

    this.actions = _actions
    setTimeout(() => {
      _.each(this.actions, action => this.actionman.set(action, this, this.id))
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

  _updateView (graph, itemsKeys) {
    this.graphView.render(graph, itemsKeys)
  }

  _createView (name, graphViewSet) {
    const view = new GraphView(graphViewSet, name)
    this.views[name] = view
    this.currentView = view
    this.currentView.on('focus', this._changeCurrentView.bind(this))
    this.currentView.selection.on('change', this.actionsPanel.update.bind(this.actionsPanel))
    if (_.keys(this.views).length > 1) {
      _.each(this.views, (view, key) => {
        if (name !== key) {
          view.resize()
          // TODO view should manage its layout on its own
          // view.layout.size(view.p.width, view.p.height)
        }
      })
    }
  }

  _changeCurrentView (viewName) {
    if (this.views[viewName] && this.views[viewName] !== this.currentView) {
      this.currentView = this.views[viewName]
      this.actionsPanel.update.call(this.actionsPanel)
    }
  }
}
window.G = new App()
