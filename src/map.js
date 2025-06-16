import * as d3 from 'd3';

export async function loadMap(
  geojson,
  taxi,
  onDataFiltered,
  margens = { left: 5, right: 5, top: 5, bottom: 5 }
  ) {
  const svg = d3.select('#map-svg');

  if (!svg) {
      console.log('SVG element not found');
      return;
  }

  // ---- Size
  const width = +svg.node().getBoundingClientRect().width - margens.left - margens.right;
  const height = +svg.node().getBoundingClientRect().height - margens.top - margens.bottom;

  // Color Scale
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, 10]);

  let projection = d3.geoMercator().
      fitExtent([[0, 0], [width, height]], geojson);

  let path = d3.geoPath()
      .projection(projection);

  const mGroup = svg.selectAll('#group')
      .data([0])
      .join('g')
      .attr('id', 'group')
      .attr('transform', `translate(${margens.left}, ${margens.top})`);

  mGroup.selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path)
      .style('fill', colorScale(0))
      .style('stroke', 'black')
      .on('click', (event, d) => handleClick(event, d, taxi, onDataFiltered));

  // ---- Zoom e Pan
  const zoom = d3.zoom()
      .scaleExtent([1, 9])
      .on('zoom', handleZoom);

  svg.call(zoom);
}


export function clearMap() {
    d3.select('#group')
        .selectAll('path')
        .remove();
}

function handleZoom({ transform }) {
    d3.select('#group')
        .selectAll('path')
        .attr('transform', transform);
}

function handleClick(event, d, taxi, onDataFiltered) {
  if (event.ctrlKey && event.target.tagName === 'path') {
      taxi.queryCountByLocation(d.properties.objectid).then(data => {
          const intData = data.map(d => ({
              DOLocationID: Number(d.DOLocationID),
              count: Number(d.count)
          }));

          const domainExtent = d3.extent(intData, d => d.count);
          const colorScale = d3.scaleSequential(d3.interpolateBlues)
              .domain(domainExtent);

          d3.selectAll('#group path')
              .style('fill', d => {
                  const id = Number(d.properties.objectid);
                  const count = intData.find(item => item.DOLocationID === id)?.count || 0;
                  return colorScale(count);
              });

          d3.select(event.target)
              .style('fill', 'yellow');

          if (onDataFiltered) {
              onDataFiltered(d.properties.objectid);
          }
      });
  }
}
