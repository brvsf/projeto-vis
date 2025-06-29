import * as d3 from 'd3';

export function histPlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }) {

    const svg = d3.select('#small-chart1').node();
    const g = d3.select('#chart1');

    if (!svg || g.empty()) {
        console.error('SVG or group element not found');
        return;
    }

    const bins = d3.bin()
        .thresholds(40)
        .value(d => d.value)
        (data);

    const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
    const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

    g.attr('transform', `translate(${margens.left}, ${margens.top})`);
    g.selectAll('*').remove();

    const xScale = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    const bars = g.selectAll('rect')
      .data(bins, d => d.x0);

  bars.enter()
    .append('rect')
    .attr('x', d => xScale(d.x0) + 1)
    .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .transition()
    .duration(400)
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - yScale(d.length));

  bars.transition()
    .duration(400)
    .attr('x', d => xScale(d.x0) + 1)
    .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - yScale(d.length))
    .attr('fill', 'steelblue');

  bars.exit()
    .transition()
    .duration(300)
    .attr('y', height)
    .attr('height', 0)
    .remove();

  g.selectAll('.axis').remove();

  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(yScale));
}
