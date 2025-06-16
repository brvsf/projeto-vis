import * as d3 from 'd3';

export async function linePlot(
  data,
  variableKey,
  month,
  margens = { left: 50, right: 50, top: 50, bottom: 50 }
) {
  const svg = d3.select('#bottom-chart-svg').node().ownerSVGElement;
  const g = d3.select('#bottom-chart-svg');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const yMin = d3.min(data, d => d[variableKey]);
  const yMax = d3.max(data, d => d[variableKey]);

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])
    .nice();

  // Aproximating the width of a day in the xScale
  const dayWidth = xScale(new Date(data[0].date.getTime() + 24*60*60*1000)) - xScale(new Date(data[0].date));

  const weekendRects = g.selectAll('rect.weekend')
    .data(data.filter(d => d.is_weekend === 1));

  weekendRects.enter()
    .append('rect')
    .attr('class', 'weekend')
    .attr('x', d => xScale(d.date))
    .attr('y', 0)
    .attr('width', dayWidth)
    .attr('height', height)
    .attr('fill', 'orange')
    .attr('opacity', 0.2)
    .merge(weekendRects)
    .transition()
    .duration(500)
    .attr('x', d => xScale(d.date))
    .attr('width', dayWidth)
    .attr('height', height)
    .attr('opacity', 0.2);

  weekendRects.exit().remove();

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d[variableKey]));

  const path = g.selectAll('.line-path').data([data]);

  path.enter()
    .append('path')
    .attr('class', 'line-path')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line)
    .merge(path)
    .transition()
    .duration(500)
    .attr('d', line);

  path.exit().remove();

  const tickDates = data.map(d => d.date);
  const xAxis = d3.axisBottom(xScale)
    .tickValues(tickDates)
    .tickFormat(d3.timeFormat('%d'));

  g.selectAll('.x-axis').data([null]).join(
    enter => enter.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end"),
    update => update
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
  );

  g.selectAll('.y-axis').data([null]).join(
    enter => enter.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale)),
    update => update
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScale))
  );

  // Title
  g.selectAll('.chart-title').data([null]).join(
    enter => enter.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -margens.top / 2)
      .style("text-anchor", "middle")
      .style("font-size", "1.5em")
      .text(`Mean ${variableKey.charAt(0).toUpperCase()+ variableKey.slice(1).replace("_", " ")} per day in ${month}`),
    update => update
      .attr("x", width / 2)
      .text(`Mean ${variableKey.charAt(0).toUpperCase()+ variableKey.slice(1).replace("_", " ")} per day in ${month}`),
  )
}
