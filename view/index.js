var width = 1000,
    height = 1000;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-820)
    .linkDistance(50)
    .size([width, height]);

var svg = d3.select("#viewport").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("/test/test.json", function(error, graph) {
  if (error) throw error;

  var edges = [];
  graph.links.forEach(function(e) {
    var sourceNode = graph.nodes.filter(function(n) {
      return n.key === e.source;
    })[0],
      targetNode = graph.nodes.filter(function(n) {
          return n.key === e.target;
      })[0];

    edges.push({
      source: sourceNode,
      target: targetNode,
      value: e.Value
    });
  });

  force
      .nodes(graph.nodes)
      .links(edges)
      .start();

  var link = svg.selectAll(".link")
      .data(edges)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value) })

  var nodes = svg.selectAll(".node")
      .data(graph.nodes, function (d) { return d.key })
    .enter().append("g")
      .attr("class", "node")
    .call(force.drag)

  nodes.append('circle')
    .attr("r", 10)
    .style("fill", function(d) { return color(d.group) })

  nodes.append("text")
    .text(function(d) { return d.value })

  force.on("tick", function() {
    link.attr("x1", function(d) { console.log(d);return d.source.x })
        .attr("y1", function(d) { return d.source.y })
        .attr("x2", function(d) { return d.target.x })
        .attr("y2", function(d) { return d.target.y })

  nodes.attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")"
  })
        
  })
})
