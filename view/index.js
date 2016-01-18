var width = 1000,
    height = 1000

var color = d3.scale.category20()

var force = d3.layout.force()
  //for big graphs
  //.charge(-820)
  //.linkDistance(50)
  .charge(-220)
  .linkDistance(40)
  .size([width, height])

var svg = d3.select('#viewport').append('svg')
  .attr('width', width)
  .attr('height', height)

d3.json('/test/test.json', onLoad)

function onLoad(error, graph) {
  if (error) throw error
  update(graph)
}
function update(graph) {
  var edges = []
  graph.links.forEach(function(e) {
    var sourceNode = graph.nodes.filter(function(n) {
      return n.key === e.source
    })[0],
      targetNode = graph.nodes.filter(function(n) {
        return n.key === e.target
      })[0]

    edges.push({
      source: sourceNode,
      target: targetNode,
      value: e.Value
    })
  })

  force
    .nodes(graph.nodes)
    .links(edges)
    .start()

  var links = svg.selectAll('.link')
    .data(edges)

  var lines = links.enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  links.exit().remove()

  var nodes = svg.selectAll('.node')
      .data(graph.nodes, function (d) { return d.key })

  var enter = nodes.enter().append('g')
  var update = nodes
  var exit = nodes.exit()

  
  enter.attr('class', 'node')
    .call(force.drag)
    .on('click', function (d) {
      getNode(d.key)
    })

  enter.append('circle')
    .attr('r', 10)
    .style('fill', function(d) { return color(d.group) })

  enter.append('text')
    .text(function (d) { return d.value })

  update
    .select('text')
    .text(function (d) { return d.value })

  exit.remove()

  force.on('tick', function () {
    links.attr('x1', function (d) { return d.source.x })
        .attr('y1', function (d) { return d.source.y })
        .attr('x2', function (d) { return d.target.x })
        .attr('y2', function (d) { return d.target.y })

    nodes.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
        
  })
}

function getNode(key) {
  var request = new XMLHttpRequest();
  request.open('GET', '/test/linkedText/' + key, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = makeGraph(key, request.responseText)
      update(data)
    } else {
      // We reached our target server, but it returned an error
    }
  }

  request.onerror = function() {
    // There was a connection error of some sort
  }

  request.send()
}

function makeGraph(key, str) {
  var graph = {nodes: []}
  var data = str.split('---')
  graph.nodes = [{key: key, value: data[2]}]
  var linked = JSON.parse(data[1])
  graph.links = _.map(linked, function (key2) {
    graph.nodes.push({key: key2, value: key2})
    return {source: key, target: key2}
  })
  return graph
}
