/**
 * Graph view based on d3.force layout
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    container: '.view.graph svg',
    link: '.link',
    node: '.node'
  }
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)

  self._links = []
  self._nodes = []

  self.color = d3.scale.category20()
  self.force = d3.layout.force()
    //for big graphs
    .charge(-400)
    .linkDistance(150)
    //.charge(-220)
    //.linkDistance(40)
    .gravity(0)
    .size([self.p.width, self.p.height])

  self.container = d3.select(self.selectors.container)
    .attr('width', self.p.width)
    .attr('height', self.p.height)

  self.p.selection.on('add', self._onSelect.bind(self))
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.render = function (vGraph) {
  var self = this
  var items = vGraph.items
  var edges = vGraph.edges
  for (var i = 0; i < items.length; i++) {
    items[i].x = items[i].x || Math.random() * self.p.width/10 + self.p.width/2 - self.p.width/20
    items[i].y = items[i].y || Math.random() * self.p.height/10 + self.p.height/2 - self.p.height/20
  }
   
  self.force
    .nodes(items)
    .links(edges)
    .start()

  self._links = self.container.selectAll(self.selectors.link)
    .data(edges)

  var lines = self._links.enter().append('line')
    .attr('class', self.selectors.link.slice(1))
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  self._links.exit().remove()

  self._nodes = self.container.selectAll(self.selectors.node)
    .data(items, function (d) { return d.key })

  var enter = self._nodes.enter().append('g')
  var update = self._nodes
  var exit = self._nodes.exit()
  
  enter.attr('class', self.selectors.node.slice(1))
    //.attr('data-key', function (d) { return d.key })
    .call(self.force.drag)
    .on('click', self._onClick.bind(self))
    .on('dblclick', self._onDblClick.bind(self))

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

Self.prototype._onSelect = function (selection) {
  var self = this
}

Self.prototype._onClick = function (node) {
  var self = this
  node.key
}

Self.prototype._onDblClick = function (node) {
  var self = this
  self.p.selection.clear()
  self.p.selection.add(node.key)
}

module.exports = Self
