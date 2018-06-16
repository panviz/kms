/**
 * Main app menu
 */
import template from './menu.html'
import './menu.scss'
import './menu.svg'

export default class Menu {
  constructor (p = {}) {
    this.p = p

    this._menuItems = [
      {
        title: 'Blog',
        url: 'http://dmitra.com/graphiy',
      }, {
        title: 'Documentation',
        url: 'http://docs.graphiy.com',
      }, {
        title: 'Vote for features',
        url: 'https://trello.com/b/W1Zvc6Pn/kms',
      }, {
        title: 'File an issue',
        url: 'http://github.com/Graphiy/kms/issues',
      }, {
        title: 'Open source on Github',
        url: 'http://github.com/Graphiy/kms',
      }, {
        title: 'GraphiTabs',
        url: '/graphitabs.html',
      },
    ]

    const $html = $(template({ items: this._menuItems }))
    this.p.container.append($html)
  }
}
