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
drawVisualization(false);
setInterval(redrawVisualization, 5 * 60 * 1000);

function humanizeSeconds(s) {
    if (s < 0) {
        return "overdue";
    }
    var years = s / (60*60*24*365);
    if (years > 1) {
        return "in more than a year";
    }
    var months = s / (60*60*24*30);
    if (months > 1.9) {
        months = Math.floor(months+0.1);
        return "in " + months + " months";
    }
    if (months > 0.9) {
        return "in a month";
    }
    var weeks = s / (60*60*24*7);
    if (weeks > 1.9) {
        weeks = Math.floor(weeks+0.1);
       return "in " + weeks + " weeks";
    }
    if (weeks > 0.9) {
        return "in a week";
    }
    var days = s / (60*60*24);
    if (days > 1.5) {
        days = Math.floor(days*10)/10;
        return "in " + days + " days";
    }
    if (days > 0.9) {
        return "in about a day";
    }
    var hours = s / (60*60);
    if (hours > 1.9) {
        hours = Math.floor(hours+0.1);
        return "in " + hours + " hours";
    }
    if (hours > 0.9) {
        return "in an hour";
    }
    return "soon";
}

function redrawVisualization() {
    drawVisualization(true);
}

function drawVisualization(isTransition) {
    d3.json("/task", function(json) {
        task_list = json;
        
        var packNodes = vis.data([task_list]).selectAll("g.node")
            .data(pack.nodes, function (d) { return d.task_id; });
    
        visualizeIt(packNodes, isTransition);
    });
}

function visualizeIt(packNodes, isTransition) {
    // Delete old stuff
    packNodes.exit().remove();
    
    // Add new stuff
    var newNodes = packNodes
      .enter().append("g");
    newNodes.filter(function (d) { return !d.children; }).append("title");
    newNodes.filter(function (d) { return !d.children; }).append("circle");
    newNodes.filter(function (d) { return !d.children; }).append("text");
    
    styleNode(packNodes, isTransition);
}

function styleNode(node, isTransition) {
	root = node;
	title = node.select("title");
	circle = node.select("circle");
	text = node.select("text");
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

    title.text(function(d) { return d.name + "\n" + humanizeSeconds(d.seconds); });

	circle.attr("r", function(d) { return d.r; })
	    .style("fill", function(d) { return d.children ?
		      			   "none" : fill(d.value); });
	
	text.attr("text-anchor", "middle")
	    .text(function(d) { return d.name; })
        .attr("dy", function(d) { return 1.5*(2*d.r)/2/d.name.length + "px";})
	    .style("font-size", function(d) { return 1.5*(2*d.r)/d.name.length + "px";});
	
}