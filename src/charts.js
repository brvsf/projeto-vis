import * as d3 from 'd3';

export function histPlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }) {
  const svg = d3.select('#small-chart1').node();
  const g = d3.select('#chart1');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  const bins = d3.bin()
    .thresholds(20)
    .value(d => Number(d.value))(data);

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const xScale = d3.scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height, 0])
    .nice();

  let xAxisGroup = g.selectAll('.x-axis').data([0]);
  xAxisGroup = xAxisGroup.enter()
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .merge(xAxisGroup);
  xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale));

  let yAxisGroup = g.selectAll('.y-axis').data([0]);
  yAxisGroup = yAxisGroup.enter()
    .append('g')
    .attr('class', 'y-axis')
    .merge(yAxisGroup);
  yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale));

  const bars = g.selectAll('.bar').data(bins, d => d.x0);

  bars.exit()
    .transition()
    .duration(400)
    .attr('y', height)
    .attr('height', 0)
    .remove();

  bars.transition()
    .duration(500)
    .attr('x', d => xScale(d.x0) + 1)
    .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - yScale(d.length));

  bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.x0) + 1)
    .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .transition()
    .duration(500)
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - yScale(d.length));
}

export function linePlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }) {
  const svg = d3.select('#small-chart2').node();
  const g = d3.select('#chart2');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const parseDate = d3.timeParse('%Y-%m-%d');

  const filteredData = data
    .map(d => ({ date: parseDate(d.date), value: Number(d.value) }))
    .filter(d => d.date && d.date.getFullYear() >= 2023 && !isNaN(d.value))
    .sort((a, b) => d3.ascending(a.date, b.date));

  const xScale = d3.scaleTime()
    .domain(d3.extent(filteredData, d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.value)])
    .range([height, 0])
    .nice();

  let xAxisGroup = g.selectAll('.x-axis').data([0]);
  xAxisGroup = xAxisGroup.enter()
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .merge(xAxisGroup);

  xAxisGroup.transition()
    .duration(600)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d')))
    .selectAll('text')
    .attr('transform')
    .style('text-anchor', 'end');

  let yAxisGroup = g.selectAll('.y-axis').data([0]);
  yAxisGroup = yAxisGroup.enter()
    .append('g')
    .attr('class', 'y-axis')
    .merge(yAxisGroup);

  yAxisGroup.transition()
    .duration(600)
    .call(d3.axisLeft(yScale));

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  let path = g.selectAll('.line-path').data([filteredData]);

  path.enter()
    .append('path')
    .attr('class', 'line-path')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .merge(path)
    .transition()
    .duration(600)
    .attr('d', line);

  path.exit().remove();
}


export function barPlot(data, margens = { left: 50, right: 50, top: 50, bottom: 50 }) {
  const svg = d3.select('#small-chart3').node();
  const g = d3.select('#chart3');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.payment_type))
    .range([0, width])
    .padding(0.2);

  const yMax = d3.max(data, d => Number(d.value));
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])
    .nice();

  let xAxisGroup = g.selectAll('.x-axis').data([0]);
  xAxisGroup = xAxisGroup.enter()
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .merge(xAxisGroup);

  xAxisGroup.transition()
    .duration(500)
    .call(d3.axisBottom(xScale)
      .tickFormat(d => {
        const labels = {
          '1': 'Cartão',
          '2': 'Dinheiro',
          '3': 'Sem cobrança',
          '4': 'Disputa',
          '5': 'Desconhecido',
        };
        return labels[d] || d;
      }));

  let yAxisGroup = g.selectAll('.y-axis').data([0]);
  yAxisGroup = yAxisGroup.enter()
    .append('g')
    .attr('class', 'y-axis')
    .merge(yAxisGroup);

  yAxisGroup.transition()
    .duration(500)
    .call(d3.axisLeft(yScale));

  const bars = g.selectAll('.bar').data(data, d => d.payment_type);

  bars.exit()
    .transition()
    .duration(500)
    .attr('y', yScale(0))
    .attr('height', 0)
    .remove();

  bars.transition()
    .duration(500)
    .attr('x', d => xScale(d.payment_type))
    .attr('y', d => yScale(Number(d.value)))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(Number(d.value)))
    .attr('fill', 'steelblue');

  bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.payment_type))
    .attr('width', xScale.bandwidth())
    .attr('y', yScale(0))
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .transition()
    .duration(500)
    .attr('y', d => yScale(Number(d.value)))
    .attr('height', d => height - yScale(Number(d.value)));
}
