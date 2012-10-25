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

var task_list;
d3.json("/task", function(json) {
	task_list = json;
	visualizeIt();
});

function redrawVisualization() {
	d3.json("/task", function(json) {
		task_list = json;
		
		vis.selectAll("g.node").data([]).exit().remove();
		visualizeIt();

//		var nodes = d3.selectAll("g.node").data([task_list]);
////		
////		// Remove bad node
////		vis.selectAll("g.node").filter(function (d) { return d.task_id == id; }).remove();
////		// Recompute good nodes
////		var nodes = d3.selectAll("g.node");
////		nodes = nodes.data([task_list]);
////		nodes = nodes.selectAll("g.node");
////		nodes = nodes.data(pack.nodes);
////		
//		if (nodes.enter()) {
//			var node = nodes.enter().append("g");
//
//			node.filter(function (d) { return !d.children; }).append("title");
//			node.append("circle");
//			node.filter(function (d) { return !d.children; }).append("text");
//		}
//		
//		styleNode(nodes, true);
	});
}

function styleNode(node, isTransition) {
	root = node;
	title = node.selectAll("title");
	circle = node.selectAll("circle");
	text = node.selectAll("text");
	if (isTransition) {
		root = root.transition();
		title = title.transition();
		circle = circle.transition();
		text = text.transition();
	}
	
	root.attr("class", function(d) { return d.children ? "internal node" : "leaf node"; })
    	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    	.attr("id", function(d) { return d.task_id; })
		.attr("onclick", function(d) { return "completeTask('"+d.task_id+"');"});

    title.text(function(d) { return d.name + "\n<due date>"; });

	circle.attr("r", function(d) { return d.r; })
	    .style("fill", function(d) { return d.children ?
		      			   "none" : fill(d.value); });
	
	text.attr("text-anchor", "middle")
	    .attr("dy", "0.5em")
	    .text(function(d) { return d.name; })
	    .style("font-size", function(d) { return 1.5*(2*d.r)/d.name.length + "px";});
	
}

function visualizeIt() {
	var node = vis.data([task_list]).selectAll("g.node")
	    .data(pack.nodes)
	  .enter().append("g");
	
	node.filter(function (d) { return !d.children; }).append("title");
	node.filter(function (d) { return !d.children; }).append("circle");
	node.filter(function (d) { return !d.children; }).append("text");
	
	styleNode(node, false);
}