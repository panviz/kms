/**
 * Server application Router
 */
const Router = function (p = {}) {
  this.p = p
  this.server = p.server
  this.init()
}

module.exports = new Router
