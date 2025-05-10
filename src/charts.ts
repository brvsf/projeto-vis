import * as d3 from 'd3';
import { Taxi } from './taxi.ts';

export async function loadChart(margens = { left: 25, right: 25, top: 25, bottom: 25 }) {
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

  // Load the data from DuckDB
  const taxi = new Taxi();
  await taxi.init();
  await taxi.loadTaxi();

  console.log('Taxi');
  console.log(taxi);
  const data: {
    trip_distance: number;
     tip_amount: number }[] = await taxi.trip_distance_per_tip_amount(
    1000,
    '2023-01-01',
    '2023-01-31'
    );

  console.log('Data');
  console.log(data);

  const minDistance = d3.min(data, d => d.trip_distance);
  const maxDistance = d3.max(data, d => d.trip_distance);
  const minTip = d3.min(data, d => d.tip_amount);
  const maxTip = d3.max(data, d => d.tip_amount);

  const xScale = d3.scaleLinear()
    .domain([minDistance, maxDistance])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([minTip, maxTip])
    .range([height, 0]);

  const circles = g.selectAll('circle')
    .data(data, (d: { trip_distance: number; tip_amount: number }) => `${d.trip_distance}-${d.tip_amount}`);

  // Exit
  circles.exit().remove();

  // Update
  circles
    .attr('cx', d => xScale(d.trip_distance))
    .attr('cy', d => yScale(d.tip_amount));

  // Enter
  circles.enter()
    .append('circle')
    .attr('cx', d => xScale(d.trip_distance))
    .attr('cy', d => yScale(d.tip_amount))
    .attr('r', 8)
    .attr('fill', 'steelblue');
}

export function clearChart() {
  d3.select('#group').html('');
}
