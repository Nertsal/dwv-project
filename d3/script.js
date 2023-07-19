process_fdg(game_data);
make_side_bar("rpg");

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
          count: genres[g1],
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
      count: v.count,
      vx: v.vx,
      vy: v.vy,
    });
  });

  var links = [];
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
      .attr("r", d => Math.sqrt(d.count) + 2)
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
    // Tooltip
    content = `<h2>${d.id}</h2>`;
    const games = d.count == 1 ? "game" : "games";
    content += `<p>${d.count} ${games}</p>`;

    var bestConnection = null;
    var bestCount = -1;
    linksMap.forEach(l => {
      if (l.connections > bestCount) {
        if (l.source.id == d.id && l.target.id != d.id) {
          bestCount = l.connections;
          bestConnection = l.target.id;
        } else if (l.target.id == d.id && l.source.id != d.id) {
          bestCount = l.connections;
          bestConnection = l.source.id;
        }
      }
    });

    if (bestConnection) {
      content += `<p>Most used with '${bestConnection}'</p>`;
    }

    tooltip.showTooltip(content, event);
    make_side_bar(d.id);

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
    svg.selectAll("g")
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

function make_side_bar(genre) {
  var dataMap = new Map();
  for (var i = 0; i < game_data.length; i++) {
    var item = game_data[i];
    if (item.genres.includes(genre)) {
      var v = dataMap.get(item.developer);
      if (!v) {
        dataMap.set(item.developer, {
          developer: item.developer,
          count: 1,
        });
      } else {
        v.count += 1;
      }
    }
  }

  var data = [];
  dataMap.forEach((v, key) => {
    data.push(v);
  });
  data.sort((a, b) => b.count - a.count);
  data = data.slice(0, 10);

  // Specify the chart’s dimensions.
  const width = 500;
  const height = 600;
  const marginTop = 20;
  const marginRight = 10;
  const marginBottom = 160;
  const marginLeft = 80;

  // Create the horizontal scale and its axis generator.
  const x = d3.scaleBand()
    .domain(d3.sort(data, d => -d.count).map(d => d.developer))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const xAxis = d3.axisBottom(x).tickSizeOuter(0);

  // Create the vertical scale.
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([height - marginBottom, marginTop]);

  // Create the SVG container and call the zoom behavior.
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "width: 100%; height: auto;");

  // Append the bars.
  svg.append("g")
    .attr("class", "bars")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.developer))
    .attr("y", d => y(d.count))
    .attr("height", d => y(0) - y(d.count))
    .attr("width", x.bandwidth());

  // Append the axes.
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-60)");

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());

  $(side_bar).html(svg.node());
}
