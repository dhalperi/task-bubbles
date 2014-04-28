var width = 640, height = 640, format = d3.format(",d");

var fill = d3.scale.linear().range([ "hsl(360, 10%, 40%)", "hsl(0, 70%, 60%)" ]).interpolate(d3.interpolateString);

function sortFunction(a, b) {
  if (a.size > b.size) {
    return -1;
  }
  if (a.size < b.size) {
    return 1;
  }
  return a.task_id - b.task_id;
}

var pack = d3.layout.pack().sort(sortFunction).size([ width - 4, height - 4 ]).value(function(d) {
  return d.size;
});

var vis = d3.select("#tasks").append("svg").attr("width", width).attr("height", height).append("g").attr("transform",
    "translate(2, 2)");

var task_list;
drawVisualization(false);
setInterval(redrawVisualization, 5 * 60 * 1000);

function humanizeSeconds(s) {
  if (s < 0) {
    return "overdue";
  }
  var years = s / (60 * 60 * 24 * 365);
  if (years > 1) {
    return "in more than a year";
  }
  var months = s / (60 * 60 * 24 * 30);
  if (months > 1.9) {
    months = Math.floor(months + 0.1);
    return "in " + months + " months";
  }
  if (months > 0.9) {
    return "in a month";
  }
  var weeks = s / (60 * 60 * 24 * 7);
  if (weeks > 1.9) {
    weeks = Math.floor(weeks + 0.1);
    return "in " + weeks + " weeks";
  }
  if (weeks > 0.9) {
    return "in a week";
  }
  var days = s / (60 * 60 * 24);
  if (days > 1.5) {
    days = Math.floor(days * 10) / 10;
    return "in " + days + " days";
  }
  if (days > 0.9) {
    return "in about a day";
  }
  var hours = s / (60 * 60);
  if (hours > 1.9) {
    hours = Math.floor(hours + 0.1);
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
  d3.json("/task", function(error, json) {
    if (error) {
      console.warn(error);
      window.location.replace('/');
      return;
    }
    task_list = json;
    if (!json) {
      return;
    }

    var packNodes = vis.data([ task_list ]).selectAll("g.node").data(pack.nodes, function(d) {
      return d.task_id;
    });

    visualizeIt(packNodes, isTransition);
  });
}

function visualizeIt(packNodes, isTransition) {
  // Delete old stuff
  packNodes.exit().remove();

  // Add new stuff
  var newNodes = packNodes.enter().append("g");
  newNodes.filter(function(d) {
    return !d.children;
  }).append("title");
  newNodes.filter(function(d) {
    return !d.children;
  }).append("circle");
  newNodes.filter(function(d) {
    return !d.children;
  }).append("text");

  styleNode(packNodes, isTransition);
}

function colorizeSeconds(d) {
  // No color for root
  if (d.children) {
    return none;
  }

  // Color in ranges of 1 minute, 1 hour, 3 hours, 1 day, 1 week, 2 weeks, 1
  // month, 6 months, 1 year, 2 years.
  var val = 0;
  if (d.seconds <= 60) {
    val = 1;
  } else if (d.seconds <= 3 * 60 * 60) {
    val = 1 - 0.1 * d.seconds / (3 * 60 * 60);
  } else if (d.seconds <= 24 * 60 * 60) {
    val = 0.9 - 0.1 * ((d.seconds - 3 * 60 * 60) / (24 * 60 * 60));
  } else if (d.seconds <= 2 * 24 * 60 * 60) {
    val = 0.8 - 0.1 * ((d.seconds - 24 * 60 * 60) / (2 * 24 * 60 * 60));
  } else if (d.seconds <= 4 * 24 * 60 * 60) {
    val = 0.7 - 0.1 * ((d.seconds - 2 * 24 * 60 * 60) / (4 * 24 * 60 * 60));
  } else if (d.seconds <= 14 * 24 * 60 * 60) {
    val = 0.6 - 0.1 * ((d.seconds - 4 * 24 * 60 * 60) / (14 * 24 * 60 * 60));
  } else if (d.seconds <= 28 * 24 * 60 * 60) {
    val = 0.5 - 0.1 * ((d.seconds - 14 * 24 * 60 * 60) / (28 * 24 * 60 * 60));
  } else if (d.seconds <= 3 * 30 * 24 * 60 * 60) {
    val = 0.4 - 0.1 * ((d.seconds - 28 * 24 * 60 * 60) / (3 * 30 * 24 * 60 * 60));
  } else if (d.seconds <= 6 * 30 * 24 * 60 * 60) {
    val = 0.3 - 0.1 * ((d.seconds - 3 * 30 * 24 * 60 * 60) / (6 * 30 * 24 * 60 * 60));
  } else if (d.seconds <= 12 * 30 * 24 * 60 * 60) {
    val = 0.2 - 0.1 * ((d.seconds - 6 * 30 * 24 * 60 * 60) / (12 * 30 * 24 * 60 * 60));
  } else if (d.seconds <= 24 * 30 * 24 * 60 * 60) {
    val = 0.1 - 0.1 * ((d.seconds - 12 * 30 * 24 * 60 * 60) / (24 * 30 * 24 * 60 * 60));
  }

  return fill(val);
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

  root.attr("class", function(d) {
    return d.children ? "internal node" : "leaf node";
  }).attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }).attr("id", function(d) {
    return d.task_id;
  }).attr("onclick", function(d) {
    return "completeTask('" + d.task_id + "');"
  });

  title.text(function(d) {
    return d.name + "\n" + humanizeSeconds(d.seconds);
  });

  circle.attr("r", function(d) {
    return d.r;
  }).style("fill", colorizeSeconds);

  text.attr("text-anchor", "middle").text(function(d) {
    return d.name;
  }).attr("dy", function(d) {
    return 1.5 * (2 * d.r) / 2 / d.name.length + "px";
  }).style("font-size", function(d) {
    return 1.5 * (2 * d.r) / d.name.length + "px";
  });

}