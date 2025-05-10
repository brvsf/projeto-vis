import * as d3 from 'd3';

export async function scatterPlot(
  data: {
    trip_distance: number;
    tip_amount: number
  }[],
  margens = { left: 25, right: 25, top: 25, bottom: 25 }) {
  const svg = d3.select('svg'); // Select the SVG element

  if (svg.empty()) {
    console.error('SVG element not found');
    return;
  }
  const width = parseInt(svg.style('width')) - margens.left - margens.right; // Calculate svg width
  const height = parseInt(svg.style('height')) - margens.top - margens.bottom; // Calculate svg height

  const group = svg.select('#group'); // Select the group element

  if (group.empty()) {
    svg.append('g').attr('id', 'group');
  } // Create a group element if it doesn't exist

  const g = svg.select('#group').attr('transform', `translate(${margens.left}, ${margens.top})`);

  const minDistance = d3.min(data, d => d.trip_distance);
  const maxDistance = d3.max(data, d => d.trip_distance);
  const minTip = d3.min(data, d => d.tip_amount);
  const maxTip = d3.max(data, d => d.tip_amount);

  // Set the scales
  const xScale = d3.scaleLinear()
    .domain([minDistance, maxDistance])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([minTip, maxTip])
    .range([height, 0]);

  const circles = g.selectAll('circle')
    .data(data, (d: { trip_distance: number; tip_amount: number }) => `${d.trip_distance}-${d.tip_amount}`);

  console.log(maxDistance, minDistance, maxTip, minTip);

  // Append the axes
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(10));
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale).ticks(10));

  // Exit
  circles.exit().remove();

  // Update
  circles
    .attr('cx', d => xScale(d.trip_distance))
    .attr('cy', d => yScale(d.tip_amount))
    .attr('r', 4);

  // Enter
  circles.enter()
    .append('circle')
    .attr('cx', d => xScale(d.trip_distance))
    .attr('cy', d => yScale(d.tip_amount))
    .attr('r', 4);
}

export function clearChart() {
  d3.select('#group').html('');
}
