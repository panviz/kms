/**
 * Graph view
 */
var Self = function (p, itemman) {
  var self = this;

  self.p = p || {}
  self.itemman = itemman
  self.color = d3.scale.category20()
  self.force = d3.layout.force()
    //for big graphs
    .charge(-820)
    .linkDistance(50)
    //.charge(-220)
    //.linkDistance(40)
    .size([self.p.width, self.p.height])

  self.container = d3.select('#viewport').append('svg')
    .attr('width', self.p.width)
    .attr('height', self.p.height)

  $(self.itemman).on('update', self.update.bind(self))
}

Self.prototype.update = function () {
  var self = this
  var items = self.itemman.items()
  var edges = self.itemman.edges()
   
  self.force
    .nodes(items)
    .links(edges)
    .start()

  self.links = self.container.selectAll('.link')
    .data(edges)

  var lines = self.links.enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  self.links.exit().remove()

  self.nodes = self.container.selectAll('.node')
    .data(items, function (d) { return d.key })

  var enter = self.nodes.enter().append('g')
  var update = self.nodes
  var exit = self.nodes.exit()
  
  enter.attr('class', 'node')
    .call(self.force.drag)
    .on('click', function (d) {
      self._onClick(d.key)
    })

  enter.append('circle')
    .attr('r', 10)
    .style('fill', function(d) { return self.color(d.group) })

  enter.append('text')
    .text(function (d) { return d.value })

  update
    .select('text')
    .text(function (d) { return d.value })

  exit.remove()

  self.force.on('tick', self._onTick.bind(self))
}

Self.prototype._onTick = function () {
  var self = this
  self.links.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self.nodes.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')'
  })
}

Self.prototype._onClick = function (key) {
  var self = this
  self.itemman.loadLinkedItem(key)
}

module.exports = Self
