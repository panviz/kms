/**
 * Graph view based on d3.force layout
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var Self = function (p) {
  var self = this
  self.p = p || {}

  self._links = []
  self._nodes = []

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
}

Self.prototype.render = function (graph) {
  var self = this
  var items = graph.items
  var edges = graph.edges
   
  self.force
    .nodes(items)
    .links(edges)
    .start()

  self._links = self.container.selectAll('.link')
    .data(edges)

  var lines = self._links.enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  self._links.exit().remove()

  self._nodes = self.container.selectAll('.node')
    .data(items, function (d) { return d.key })

  var enter = self._nodes.enter().append('g')
  var update = self._nodes
  var exit = self._nodes.exit()
  
  enter.attr('class', 'node')
    .call(self.force.drag)
    .on('click', self._onClick.bind(self))

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
  self._links.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self._nodes.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')'
  })
}

Self.prototype._onClick = function (node) {
  var self = this
  $(self).trigger('show-linked', node.key)
}

module.exports = Self
