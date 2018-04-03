/**
 * Client application is run in browser
 */
import { Actionman } from '@graphiy/actionman'
import Util from '../core/util'
import Itemman from './ui/itemman'
import Menu from './ui/main-menu/menu'
import ActionsPanel from './ui/actions-panel/panel'
import './style/index.scss'

const _views = {
  /* eslint-disable */
  graph: require('./view/graph/graph').default,
  list: require('./view/list/list').default,
  htmlList: require('./view/list/htmlList').default,
  /* eslint-enable */
}

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
  require('./action/item/savePosition').default,
  require('./action/item/deletePosition').default,
  /* eslint-enable */
]

export default class App {
  constructor () {
    this.defaultViews = [
      { name: 'view1', type: 'graph' },
      { name: 'view2', type: 'list' },
    ]
    this.id = 'app'
    this.views = {}
    this.actionman = new Actionman()
    this.itemman = new Itemman({ app: this })
    this.itemman.on('repo:load', this._createViews.bind(this))
    this.elements = Util.findElements('body', this.selectors)

    this.itemman.loadRepo()

    this.actionsPanel = new ActionsPanel({
      container: this.elements.sidebar,
      actionman: this.actionman,
    })

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

  async _createViews () {
    const graphViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.viewContainer,
    }
    let views = {}
    const graph = await this.itemman.reloadGraph(this.itemman.serviceItems.views)

    if (_.isEmpty(graph.getItemsMap())) {
      await Promise.all(this.defaultViews.map(async (view) => {
        const key = await this.itemman.initViewNode(view)
        views[key] = view
      }))
    } else {
      views = graph.getItemsMap()
      _.each(views, (view, key) => {
        views[key] = JSON.parse(view)
      })
    }

    _.each(views, (view, key) => {
      this._createView(_.assign({ key }, view, graphViewSet))
    })
  }

  _createView (graphViewSet) {
    const viewType = graphViewSet.type
    const Klass = _views[viewType]
    const newView = new Klass(graphViewSet)
    this.views[graphViewSet.name] = newView
    this.currentView = newView
    this.currentView.on('focus', this._changeCurrentView.bind(this))
    this.currentView.selection.on('change', this.actionsPanel.update.bind(this.actionsPanel))
    this.currentView.fixedNodes.on('change', this.actionsPanel.update.bind(this.actionsPanel))
    if (_.keys(this.views).length > 1) {
      _.each(this.views, (view, key) => {
        if (graphViewSet.name !== key) {
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
