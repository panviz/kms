/**
 * Main app menu
 */
var Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}

  self.selectors = {
    input: 'input',
  }
  self._menuItems = [
    {
      title: 'Blog',
      url: 'http://dmitra.com/graphiy'
    }, {
      title: 'Documentation on Wiki',
      url: 'http://github.com/Graphiy/kms/wiki'
    }, {
      title: 'Vote for features',
      url: 'https://trello.com/b/W1Zvc6Pn/kms'
    }, {
      title: 'File an issue',
      url: 'http://github.com/Graphiy/kms/issues'
    }, {
      title: 'Open source on Github',
      url: 'http://github.com/Graphiy/kms'
    }, {
      title: 'GraphiTabs',
      url: '/graphitabs.html'
    }
  ]
  var $html = $(G.Templates['ui/main-menu/menu']({items: self._menuItems}))
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)
}

module.exports = Self
