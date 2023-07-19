process_fdg(game_data);

function process_fdg(data) {
  var nodesMap = new Map();
  var linksMap = new Map();
  data.forEach(d => {
    for (var i = 0; i < d.genres.length; i++) {
      const g1 = d.genres[i];
      if (!nodesMap.get(g1)) {
        nodesMap.set(g1, {
          vx: Math.random(),
          vy: Math.random(),
          radius: genres[g1],
        });
      }
      for (var j = i; j < d.genres.length; j++) {
        const g2 = d.genres[j];
        const key = `${g1},${g2}`;
        var v = linksMap.get(key);
        if (!v) {
          linksMap.set(key, {
            source: g1,
            target: g2,
            connections: 1,
          });
        } else {
          v.connections += 1;
        }
      }
    }
  });

  var nodes = [];
  nodesMap.forEach((v, genre) => {
    nodes.push({
      id: genre,
      r: v.radius,
      vx: v.vx,
      vy: v.vy,
    });
  });

  var links = []
  linksMap.forEach((v, key) => {
    links.push(v);
  });

  // Specify the dimensions of the chart.
  const width = 600;
  const height = 600;

  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const tooltip = Tooltip("tooltip", 230);

  // Create a simulation with several forces.
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).strength(0.03))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "width: 100%; height: 100%; background-color: #222;");

  // Add a line for each link, and a circle for each node.
  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.pow(d.connections, 0.7));

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", d => Math.sqrt(d.r) + 2)
      .attr("fill", d => color(d.group));

  // node.append("title")
  //     .text(d => d.id);

  // Add a drag behavior.
  node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
      .on("mouseover", mouse_over)
      .on("mousemove", mouse_move)
      .on("mouseout", mouse_out);
  
  // Set the position attributes of links and nodes each time the simulation ticks.
  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  function neighboring(d, n) {
    return d.id === n.id || linksMap.get(`${d.id},${n.id}`) || linksMap.get(`${n.id},${d.id}`);
  }

  function mouse_over(event, d) {
    content = "<h2>" + d.id + "</h2>"
    tooltip.showTooltip(content, event);

    // Highlight neighbour nodes
    node.style("opacity", n => {
      if (neighboring(d, n)) {
        return 1.0;
      } else {
        return 0.2;
      }
    });

    // Higlight links
    link
      .attr("stroke", l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          return "#ddd";
        } else {
          return "#333";
        }
      });
  }

  function mouse_move(event) {
    tooltip.updatePosition(event)
  }

  function mouse_out(d) {
    tooltip.hideTooltip();

    // Remove highlights
    node.style("opacity", 1.0);
    link.attr("stroke", "#555");
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    tooltip.hideTooltip();
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    tooltip.hideTooltip();
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  function handleZoom(event) {
    d3.selectAll("g")
      .attr("transform", event.transform)
  }
  const zoom = d3.zoom().on("zoom", handleZoom);
  svg.call(zoom);

  // When this cell is re-run, stop the previous simulation. (This doesn’t
  // really matter since the target alpha is zero and the simulation will
  // stop naturally, but it’s a good practice.)
  // invalidation.then(() => simulation.stop());

  force_directed.append(svg.node());
}
