var width = 640,
    height = 640,
    format = d3.format(",d");

var fill = d3.scale.linear()
    .range(["hsl(-180, 50%, 50%)", "hsl(0, 50%, 50%)"])
    .interpolate(d3.interpolateString);

var pack = d3.layout.pack()
    .sort(function (a,b) { return d3.descending(a,b); })
    .size([width - 4, height - 4])
    .value(function(d) { return d.size; });

var vis = d3.select("#tasks").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(2, 2)");

d3.json("/js/tasks.json", function(json) {
  console.log(json);
  var node = vis.data([json]).selectAll("g.node")
      .data(pack.nodes)
    .enter().append("g")
      .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return d.children ?
	      			   "none" : fill(d.value); });

  node.filter(function(d) { return !d.children; }).append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.5em")
      .text(function(d) { return d.name.substring(0, d.r / 3); });
});
