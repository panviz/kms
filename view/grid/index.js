/**
 * Grid view
 * Items are represented with tiles
 */
var Self = function (p) {
  var self = this
  self.p = p || {}

  self._links = []
  self._nodes = []
}

Self.prototype.render = function (graph) {
  var self = this
  var node = this.settings[this.type]
  self.items.each(function(item){
    item.width = node.width
    item.height = node.height
  })

  self._placeGrid(self.items, {x: 50, y: 50, columns: node.columns, spacing: node.spacing})
  
  //place nodes on new coords
  newNodes
    .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });

  //animate tile form change
  var tileForm = self.vis.selectAll("rect")
    .transition()
    .duration(500)
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("width", node.width )
    .attr("height", node.height)
  self.vis.selectAll(".tileIcon")
    .transition().duration(500)
    .attr("x", node.icon.margin.x)
    .attr("y", node.height - node.icon.margin.y - node.icon.size.height)
  self.vis.selectAll('.tileTextObject')
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", node.width )
    .attr("height", node.height )
  self.vis.selectAll(".tileTitleBody")
    .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
    .attr("style", "width:"+node.width+"px;font-size:"+ node.fontSize+'px;')
  self.vis.selectAll(".tileDomainObject")
    .attr("width", node.urlWidth )
    .attr("height", node.urlHeight )
    .attr("x", self.width - node.urlWidth - 10)
  self.vis.selectAll(".tileDomainBody")
    .html(function(d){ return "<div class='tileUrl "+self.type+"'>"+d.url+"</div>"})
    .attr("style", "width:"+node.urlWidth+"px;font-size:"+ node.fontSize+'px;')

  //draw new tiles
  newNodes.append("rect")
    .attr("width", node.width )
    .attr("height", node.height)
    .style("fill", function(d){return d.color})
    .style("fill-opacity", 0.9)
  newNodes.append("image")
    .attr("class", "tileIcon")
    .attr("xlink:href", function(d){ return d.icon})
    .attr("width", node.icon.size.width)
    .attr("height", node.icon.size.height )
    .attr("x", node.icon.margin.x)
    .attr("y", node.height - node.icon.margin.y - node.icon.size.height)
  //tile title
  newNodes.append('foreignObject')
    .attr("class", "tileTextObject")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", node.width )
    .attr("height", node.height )
    .append("xhtml:body")
      .attr("class", "tileTitleBody")
      .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
      .attr("style", "width:"+node.width+"px;font-size:"+ node.fontSize+'px;')

  //item url
  newNodes.append('foreignObject')
    .attr("class", "tileDomainObject")
    .attr("width", node.urlWidth )
    .attr("height", node.urlHeight )
    .attr("x", self.width - node.urlWidth - 10)
    .append("xhtml:body")
      .attr("class", "tileDomainBody")
      .html(function(d){ return "<div class='tileUrl "+self.type+"'>"+d.url+"</div>"})
      .attr("style", "width:"+node.urlWidth+"px;font-size:"+ node.fontSize+'px;')

  //animate new nodes appear
  newNodes.transition()
    .duration(1000)
    .attr('opacity', 1)
}

module.exports = Self
