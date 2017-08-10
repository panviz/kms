/**
 * Main app menu
 */
import EventEmitter from 'eventemitter3'
import Util from '../../../core/util'
import template from './menu.html'
import './menu.scss'
import './menu.svg'
import "../../../node_modules/material-design-lite/src/mdlComponentHandler.js"
import "../../../node_modules/material-design-lite/src/menu/menu.js"

/*export default function Menu (p) {
  this.p = p || {}

  this.selectors = {
    input: 'input',
  }
  this._menuItems = [
    {
      title: 'Blog',
      url: 'http://dmitra.com/graphiy',
    }, {
      title: 'Documentation on Wiki',
      url: 'http://github.com/Graphiy/kms/wiki',
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
  this.elements = Util.findElements($html, this.selectors)
}*/

export default class Menu {
  constructor(p = {}) {
    this.p = p

    this._menuItems = [
      {
        title: 'Blog',
        url: 'http://dmitra.com/graphiy',
      }, {
        title: 'Documentation on Wiki',
        url: 'http://github.com/Graphiy/kms/wiki',
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

    const $html = $(template({items: this._menuItems}))
    this.p.container.append($html)
//    this.elements = Util.findElements($html, this.selectors)
  }

  get selectors() {
    return {
      input: 'input',
    }
  }

}