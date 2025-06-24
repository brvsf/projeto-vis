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

  const formatDateHour = d3.timeFormat('%Y-%m-%d');

  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', (event) => {
      if (event.selection) {
        const [x0, x1] = event.selection;
        const date0 = xScale.invert(x0);
        const date1 = xScale.invert(x1);

        // Formata as datas no formato desejado
        const formattedDate0 = formatDateHour(date0);
        const formattedDate1 = formatDateHour(date1);

        if (typeof onBrushCallback === 'function') {
          onBrushCallback(formattedDate0, formattedDate1);
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

export function donutPlot(data, onSelectCallback = () => {}, selectedHours = new Set()) {

  const svg = d3.select('#side-svg');
  const { width, height } = svg.node().getBoundingClientRect();
  const radius = Math.min(width, height) / 2;

  const g = svg.selectAll('#side-chart')
    .data([0])
    .join('g')
    .attr('id', 'side-chart')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const hourTotals = Array.from({ length: 24 }, (_, h) => ({ hour: h, value: 0 }));

  data.forEach(d => {
    let h = d.hour;
    if (typeof h === 'string') {
      h = new Date(h).getHours();
    } else {
      h = +h;
    }

    let val = d.value;
    if (typeof val === 'bigint') val = Number(val);

    if (!isNaN(h) && h >= 0 && h < 24) {
      hourTotals[h].value += val;
    }
  });

  const color = d3.scaleSequential()
    .domain([0, d3.max(hourTotals, d => d.value)])
    .interpolator(d3.interpolateReds);

  const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius - 10);

  const pie = d3.pie()
    .sort(null)
    .value(() => 1);

  const pieData = pie(hourTotals);

  const arcs = g.selectAll('path')
    .data(pieData, d => d.data.hour);

  function getTextColor(hour) {
      const norm = hour / 23;
      return norm > 0.4 ? 'white' : 'black';
    }

  arcs.enter()
    .append('path')
    .attr('class', 'donut-slice')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('fill', d => selectedHours.has(d.data.hour) ? 'steelblue' : color(d.data.value))
    .attr('d', arc)
    .style('cursor', 'pointer')
    .on('click', function (event, d) {
      const hour = d.data.hour;
      if (selectedHours.has(hour)) {
        selectedHours.delete(hour);
      } else {
        selectedHours.add(hour);
      }
      onSelectCallback(new Set(selectedHours));
      donutPlot(data, onSelectCallback, selectedHours);
    })
    .append('title')
    .text(d => `${d.data.hour}h: ${d.data.value} corridas`);

  arcs
    .transition()
    .duration(300)
    .attr('d', arc)
    .attr('fill', d => selectedHours.has(d.data.hour) ? 'steelblue' : color(d.data.value));

  arcs.exit().remove();

  const texts = g.selectAll('text')
    .data(pieData, d => d.data.hour);

  texts.enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 10)
    .attr('fill', d => getTextColor(d.data.hour))
    .attr('pointer-events', 'none')
    .merge(texts)
    .transition()
    .duration(300)
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .text(d => `${d.data.hour}h`);

  texts.exit().remove();
}
