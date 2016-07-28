/**
 * Server application Router
 */
const Self = function (p = {}) {
  this.p = p
  this.server = p.server
  this.init()
}

module.exports = new Self
