import * as d3 from 'd3';

export function histPlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }) {

    const svg = d3.select('#small-chart').node();
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

    const xScale = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    svg.append("g")
        .attr("fill", "steelblue")
      .selectAll()
      .data(bins)
      .join("rect")
        .attr("x", (d) => x(d.x0) + 1)
        .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
        .attr("y", (d) => y(d.length))
        .attr("height", (d) => y(0) - y(d.length));
}
