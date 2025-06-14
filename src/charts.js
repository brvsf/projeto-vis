import * as d3 from 'd3';
import { formatK } from './data.js';

export async function barPlotWeekday(
  data,
  variableKey,
  month,
  margens = { left: 75, right: 75, top: 75, bottom: 75 }
) {
  const svg = d3.select('svg');

  if (svg.empty()) {
    console.error('SVG element not found');
    return;
  }

  const width = parseInt(svg.style('width')) - margens.left - margens.right;
  const height = parseInt(svg.style('height')) - margens.top - margens.bottom;

  if (svg.select('#group').empty()) {
    svg.append('g').attr('id', 'group');
  }

  // selecting svg
  const g = svg
    .select('#group')
    .attr('transform', `translate(${margens.left}, ${margens.top})`);

  // scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.weekday))
    .range([0, width])
    .padding(0.2);

  const yMax = d3.max(data, d => Number(d[variableKey])) || 0;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  // removing existing axes
  g.selectAll('.x-axis').remove();
  g.selectAll('.y-axis').remove();
  g.selectAll('.chart-title').remove();
  g.selectAll('.x-axis-label').remove();
  g.selectAll('.y-axis-label').remove();

  // new axes
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  // axes titles
  g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margens.bottom - 20)
    .style("text-anchor", "middle")
    .text("Weekday");

  g.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margens.left + 20)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text(variableKey);

  // chart title
  g.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -margens.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "1.5em")
    .text(`${variableKey.charAt(0).toUpperCase()+ variableKey.slice(1).replace("_", " ")} per Weekday in ${month}`);

  // join rectangles
  const bars = g.selectAll('rect')
    .data(data, d => d.weekday);


  // Exit
  bars.exit()
    .attr('y', yScale(0))
    .attr('height', 0)
    .remove();

  // Update
  bars
    .attr('x', d => xScale(d.weekday))
    .attr('y', d => yScale(Number(d[variableKey])))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(Number(d[variableKey])))
    .attr('fill', d=> d.is_weekend === 1 ? 'orange' : 'steelblue');

  // Enter
  bars.enter()
    .append('rect')
    .attr('x', d => xScale(d.weekday))
    .attr('y', yScale(0))
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .attr('fill', d=> d.is_weekend === 1 ? 'orange' : 'steelblue')
    .attr('y', d => yScale(Number(d[variableKey])))
    .attr('height', d => height - yScale(Number(d[variableKey])));
}

export async function barPlotHour(
  data,
  aggregation = "Average",
  margens = { left: 75, right: 75, top: 75, bottom: 75 }
) {
  const svg = d3.select('svg');

  if (svg.empty()) {
    console.error('SVG element not found');
    return;
  }

  const width = parseInt(svg.style('width')) - margens.left - margens.right;
  const height = parseInt(svg.style('height')) - margens.top - margens.bottom;

  if (svg.select('#group').empty()) {
    svg.append('g').attr('id', 'group');
  }

  const g = svg
    .select('#group')
    .attr('transform', `translate(${margens.left}, ${margens.top})`);

  data.sort((a, b) => +a.hour - +b.hour);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.hour))
    .range([0, width])
    .padding(0.2);

  const yMax = d3.max(data, d => Number(d["tip"])) || 0;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  g.selectAll('.x-axis, .y-axis, .chart-title, .x-axis-label, .y-axis-label').remove();

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margens.bottom - 20)
    .style("text-anchor", "middle")
    .text("Hour");

  g.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margens.left + 20)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text(`Tip ${aggregation}`);

  g.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -margens.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "1.5em")
    .text(`Tip ${aggregation.charAt(0).toUpperCase() + aggregation.slice(1).replace("_", " ")} per Hour`);

  const bars = g.selectAll('rect')
    .data(data, d => d.hour);

  bars.exit()
    .attr('y', yScale(0))
    .attr('height', 0)
    .remove();

  bars
    .attr('x', d => xScale(d.hour))
    .attr('y', d => yScale(Number(d["tip"])))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(Number(d["tip"])))
    .attr('fill', 'steelblue');

  bars.enter()
    .append('rect')
    .attr('x', d => xScale(d.hour))
    .attr('y', yScale(0))
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .attr('y', d => yScale(Number(d["tip"])))
    .attr('height', d => height - yScale(Number(d["tip"])));
}

export async function boxPlot(
  groupedData,
  variableKey,
  month,
  margens = { left: 50, right: 50, top: 50, bottom: 50 }
) {
  const svg = d3.select('#full-right').node().ownerSVGElement;
  const g = d3.select('#full-right');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const xScale = d3.scaleBand()
    .domain(groupedData.map(d => d.key))
    .range([0, width])
    .padding(0.2);

  const yMin = d3.min(groupedData, d => d.min);
  const yMax = d3.max(groupedData, d => d.max) + 30;

  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0])
    .nice();

  g.selectAll('.x-axis-full-right').data([null]).join(
    enter => enter.append('g')
      .attr('class', 'x-axis-full-right')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)),
    update => update
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
  );

  g.selectAll('.y-axis-full-right').data([null]).join(
    enter => enter.append('g')
      .attr('class', 'y-axis-full-right')
      .call(d3.axisLeft(yScale)),
    update => update
      .call(d3.axisLeft(yScale))
  );

  const boxWidth = xScale.bandwidth();

  const boxGroups = g.selectAll('.full-right')
    .data(groupedData, d => d.key)
    .join(
      enter => {
        const box = enter.append('g')
          .attr('class', 'full-right')
          .attr('transform', d => `translate(${xScale(d.key)},0)`);

        // Whiskers
        box.append('line')
          .attr('class', 'whisker')
          .attr('stroke', 'black')

        // Box
        box.append('rect')
          .attr('class', 'box')
          .attr('fill', d=> (d.key === 'Sunday' || d.key === 'Saturday') ? 'orange' : 'steelblue')
          .attr('stroke', 'black')

        // Median line
        box.append('line')
          .attr('class', 'median')
          .attr('stroke', 'black')
          .attr('stroke-width', 2)

        // Outliers container
        box.append('g')
          .attr('class', 'outliers');

        return box;
      },
      update => update.attr('transform', d => `translate(${xScale(d.key)},0)`),
      exit => exit.remove()
    );

  // Update whiskers
  boxGroups.select('.whisker')
    .attr('x1', boxWidth / 2)
    .attr('x2', boxWidth / 2)
    .attr('y1', d => yScale(d.min))
    .attr('y2', d => yScale(d.max));

  // Update box
  boxGroups.select('.box')
    .attr('x', 0)
    .attr('y', d => yScale(d.q3))
    .attr('width', boxWidth)
    .attr('height', d => yScale(d.q1) - yScale(d.q3));

  // Update median
  boxGroups.select('.median')
    .attr('x1', 0)
    .attr('x2', boxWidth)
    .attr('y1', d => yScale(d.q2))
    .attr('y2', d => yScale(d.q2));

  // Update outliers
  const maxOutlier = yMax;

  boxGroups.select('.outliers')
    .selectAll('circle')
    .data(d => d.outliers.filter(v => v < maxOutlier))
    .join(
      enter => enter.append('circle')
        .attr('r', 2)
        .attr('fill', 'black')
        .attr('opacity', 0.3)
        .transition()
        .duration(500),
      update => update,
      exit => exit.remove()
    )
    .attr('cx', () => boxWidth / 2 + (Math.random() - 0.5) * 4)
    .attr('cy', d => yScale(d));

  // Title
  g.selectAll('.chart-title').data([null]).join(
    enter => enter.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -margens.top / 2)
      .style("text-anchor", "middle")
      .style("font-size", "1.5em")
      .text(`${variableKey.charAt(0).toUpperCase()+ variableKey.slice(1).replace("_", " ")} per Weekday in ${month}`),
    update => update
      .attr("x", width / 2)
      .text(`${variableKey.charAt(0).toUpperCase()+ variableKey.slice(1).replace("_", " ")} per Weekday in ${month}`),
  )
}

export async function treemapPlot(
  data,
  aggregation = "avg",
  margens = { left: 2, right: 2, top: 50, bottom: 2 }
) {
  const svg = d3.select('#full-right').node().ownerSVGElement;
  const g = d3.select('#full-right');

  if (!svg || g.empty()) {
    console.error('SVG or group element not found');
    return;
  }

  if (aggregation === "count") {
    data = data.map(d => ({
      ...d,
      tip: typeof d.tip === 'bigint' ? Number(d.tip) : d.tip
    }));
  }

  const width = parseInt(d3.select(svg).style('width')) - margens.left - margens.right;
  const height = parseInt(d3.select(svg).style('height')) - margens.top - margens.bottom;

  g.attr('transform', `translate(${margens.left}, ${margens.top})`);

  const root = d3.hierarchy({ children: data })
    .sum(d => d.tip)
    .sort((a, b) => b.value - a.value);

  const treemapLayout = d3.treemap()
    .size([width, height])
    .paddingInner(1);

  treemapLayout(root);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.tip))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length));

  g.selectAll('.chart-title').data([null]).join(
    enter => enter.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -margens.top / 2)
      .style("text-anchor", "middle")
      .style("font-size", "1.5em")
      .text(`Tip ${aggregation.charAt(0).toUpperCase() + aggregation.slice(1).replace("_", " ")} per Hour`),
    update => update
      .attr("x", width / 2)
      .text(`Tip ${aggregation.charAt(0).toUpperCase() + aggregation.slice(1).replace("_", " ")} per Hour`)
  )

  const nodes = g.selectAll('g.node')
    .data(root.leaves(), d => d.data.hour);

  nodes.exit().remove();

  nodes
    .attr('transform', d => `translate(${d.x0},${d.y0})`)
    .select('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => color(d.data.hour));

  nodes.select('text.tip-text')
    .attr('x', 4)
    .attr('y', 14)
    .style('display', d => {
      const w = d.x1 - d.x0, h = d.y1 - d.y0;
      return w * h < 2000 ? 'none' : null;
    })
    .text(d => formatK(d.data.tip));

  nodes.select('text.hour-text')
    .attr('x', 4)
    .attr('y', 28)
    .style('display', d => {
      const w = d.x1 - d.x0, h = d.y1 - d.y0;
      return w * h < 2000 ? 'none' : null;
    })
    .text(d => `${String(Number(d.data.hour))}h`);

  nodes.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x0},${d.y0})`)
    .call(enterGroup => {
      enterGroup.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => color(d.data.hour))
        .attr('stroke', '#fff');

      enterGroup.append('text')
        .attr('class', 'tip-text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('font-family', 'sans-serif')
        .attr('font-size', 12)
        .attr('fill', 'black')
        .style('display', d => {
          const w = d.x1 - d.x0, h = d.y1 - d.y0;
          return w * h < 2000 ? 'none' : null;
        })
        .text(d => formatK(d.data.tip));

      enterGroup.append('text')
        .attr('class', 'hour-text')
        .attr('x', 4)
        .attr('y', 28)
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('fill', 'black')
        .attr('opacity', 0.9)
        .style('display', d => {
          const w = d.x1 - d.x0, h = d.y1 - d.y0;
          return w * h < 2000 ? 'none' : null;
        })
        .text(d => `${String(Number(d.data.hour))}h`);
    });
}

export async function linePlot(
  data,
  variableKey,
  month,
  margens = { left: 50, right: 50, top: 50, bottom: 50 }
) {
  const svg = d3.select('#bottom-chart').node().ownerSVGElement;
  const g = d3.select('#bottom-chart');

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

export function fullClearChart() {
  d3.select('#group').html('');
  d3.select('#bottom-chart').html('')
  d3.select('#full-right').html('');
}

export function clearChart() {
  d3.select('#full_right').html('');
  d3.select('#bottom-chart').html('')
}
