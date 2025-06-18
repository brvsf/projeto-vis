import * as d3 from 'd3';

export function linePlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }, onBrushCallback) {
  const svg = d3.select('#bottom-chart-svg').node();
  const g = d3.select('#bottom-chart');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  data.forEach(d => {
    d.date = new Date(d.date);
    if (typeof d.value === 'bigint') {
      d.value = Number(d.value.toString());
    } else {
      d.value = +d.value;
    }
  });

  const dateExtent = d3.extent(data, d => d.date);
  const allDates = d3.timeDay.range(dateExtent[0], d3.timeDay.offset(dateExtent[1], 1)); // inclui último dia

  const dataMap = new Map(data.map(d => [d.date.toDateString(), d.value]));
  const completeData = allDates.map(date => ({
    date,
    value: dataMap.get(date.toDateString()) ?? 0
  }));

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const xScale = d3.scaleTime()
    .domain(d3.extent(completeData, d => d.date))
    .range([0, width]);

  const yMax = d3.max(completeData, d => d.value);
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])
    .nice();

  const months = d3.timeMonth.range(dateExtent[0], d3.timeMonth.offset(dateExtent[1], 1));

  const xAxis = d3.axisBottom(xScale)
    .tickValues(months)
    .tickFormat(d => d.getMonth() + 1);

  const yAxis = d3.axisLeft(yScale)
    .ticks(yMax < 10 ? yMax : 10)
    .tickFormat(d => Number.isInteger(d) ? d : '');

  g.selectAll('.x-axis').data([0]).join(
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

  g.selectAll('.y-axis').data([0]).join(
    enter => enter.append('g')
      .attr('class', 'y-axis')
      .call(yAxis),
    update => update
      .transition()
      .duration(500)
      .call(yAxis)
  );

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

  const path = g.selectAll('.line-path').data([completeData]);

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

  // Brush para seleção horizontal
  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', (event) => {
      if (event.selection) {
        const [x0, x1] = event.selection;
        const date0 = xScale.invert(x0);
        const date1 = xScale.invert(x1);
        if (typeof onBrushCallback === 'function') {
          onBrushCallback(date0, date1);
        }
      } else {
        if (typeof onBrushCallback === 'function') {
          onBrushCallback(null, null);
        }
      }
    });

  g.selectAll('.brush').remove();
  g.append('g')
    .attr('class', 'brush')
    .call(brush);
}
