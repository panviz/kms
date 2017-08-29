/**
 * Client application is run in browser
 */
import Util from '../core/util'
import ClientUtil from './util' //eslint-disable-line
import Provider from '../provider/api.client/index'
import Collection from '../core/collection'
import UI from './ui/ui'
import Graph from '../provider/graph/index'
import './style/index.scss'

class App {
	constructor () {
		this.rootKey = '000000001vGeH72LxVtxKg'
		this._itemtypes = ['tag', 'note']
		this._serviceItems = ['root', 'visibleItem', 'itemtype']
		this.serviceItem = {}
		this.graph = {}

		this.selection = new Collection()

		const providerSet = {
			url: '/item',
		}
		this.provider = new Provider(providerSet)

		this.selection.on('change', this._onSelect.bind(this))
		this.ui = new UI({ itemman: this, selection: this.selection })

		this._loadRepo()
	}

	async showChildren (keyS, dbclick) {
		const keys = Util.pluralize(keyS)

		// TODO multiple
		if (dbclick) {
			const rootKey = keys[0]
			const graph = await this._request('getGraph', rootKey, 1)
			this._filter(graph)
			const context = graph.get(rootKey)
			graph.remove(rootKey)
			this.ui.linkedList.setTitle(`Show children for ${context} context`)
			this.ui.linkedList.show()

			this.ui.linkedList.render(graph.getItemsMap())
		} else {
			const rootKey = keys[0]
			await this._reloadGraph(rootKey)
			this.graph.remove(rootKey)
			this._updateGraphView({ tags: [], notes: [] })
		}
	}

	async createItem (p = {}) {
		const selected = this.selection.getAll()
		await this._request('createAndLinkItem', _.concat(this.serviceItem.visibleItem, this.serviceItem[p], selected))
		await this._reloadGraph(this.serviceItem.visibleItem)
		this._updateGraphView({ tags: [], notes: [] })
	}

	async editItem (key) {
		const value = await this._request('get', key)
		this.ui.editor.set(value, key)
		this.ui.editor.setTitle('Edit item')
		this.ui.editor.show()
	}

	async saveItem (value, key) {
		const _key = await this._request('set', value, key)
		if (_key === key) {
			this.ui.editor.saved()
			await this._reloadGraph(this.serviceItem.visibleItem)
			this._updateGraphView({ tags: [], notes: [] })
		}
	}

	async removeItem (keys) {
		await this._request('remove', keys)
		await this._reloadGraph(this.serviceItem.visibleItem)
		this._updateGraphView({ tags: [], notes: [] })
	}

	async hide (keys) {
		await this._request('setDisassociate', this.serviceItem.visibleItem, keys)
		await this._reloadGraph(this.serviceItem.visibleItem)
		this._updateGraphView({ tags: [], notes: [] })
	}

	async linkItems (source, targets) {
		await this._request('associate', source, targets)
		await this._reloadGraph(this.serviceItem.visibleItem)
		this._updateGraphView({ tags: [], notes: [] })
	}

	async unlinkItems (source, targets) {
		await this._request('setDisassociate', source, targets)
		await this._reloadGraph(this.serviceItem.visibleItem)
		this._updateGraphView({ tags: [], notes: [] })
	}

	visibleLinked (parent) {
		return this.graph.getLinked(parent)
	}
	/**
	 * Populate view with user data from previous time
	 */
	async _loadRepo () {
		let graph = await this._request('getGraph', this.rootKey, 1)
		if (_.isEmpty(graph.getItemsMap())) {
			await this._initRepo()
		} else {
			_.each(this._serviceItems.concat(this._itemtypes), (item) => {
				this.serviceItem[item] = graph.search(this.rootKey, item)[0]
			})
			this.serviceItem.root = this.rootKey
		}
		// получаем все для обработки иконок
		await this._reloadGraph([this.serviceItem.visibleItem,
			this.serviceItem.tag,
			this.serviceItem.note])
		this._updateGraphView({ tags: [], notes: [] })
	}

	_initRepo () {
		const graph = new Graph
		graph.set('root', this.rootKey)
		_.each(this._serviceItems.concat(this._itemtypes), (item) => {
			if (item === 'root') return
			this.serviceItem[item] = graph.set(item)
			graph.associate(this.rootKey, this.serviceItem[item])
			if (this._itemtypes.includes(item)) {
				graph.associate(this.serviceItem.itemtype, this.serviceItem[item])
			}
		})
		return this._request('merge', graph)
	}

	_onSelect () {
		const keys = this.selection.getAll()
		if (keys.length === 1) {
			const key = keys[0]
			if (this.ui.editor.isVisible()) {
				const value = this.graph.get(key)
				this.ui.editor.set(value, key)
			}
		} else if (keys.length === 0) this.ui.hideSecondaryViews()
	}

	/**
	 * Sync graph with server
	 */
	async _reloadGraph (context, depth = 1) {
		const graph = await this._request('getGraph', context, depth)
		this._filter(graph)
		this.graph = graph
	}

	_updateGraphView (itemsKeys) {
		this.ui.graphView.render(this.graph, itemsKeys)
	}

	_filter (data) {
		let graph
		let keys
		const serviceKeys = _.toArray(this.serviceItem)
		if (data.providerID) graph = data
		if (_.isArray(data)) keys = data
		if (graph) {
			graph.remove(serviceKeys)
			return graph
		}
		_.pullAll(keys, serviceKeys)
		return keys
	}

	/**
	 * Translate graph function calls to server
	 */

	async _request (method, ...args) {
		let data = await $.post({
			url: '/graph/',
			data: {
				method,
				args: JSON.stringify(args),
			},
		})
		return data.items && data.links ? new Graph(data) : data
	}
}

window.G = new App()
