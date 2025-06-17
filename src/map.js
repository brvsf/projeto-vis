import * as d3 from 'd3';

const selectedIds = new Set();

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

  const projection = d3.geoMercator()
    .fitExtent([[0, 0], [width, height]], geojson);

  const path = d3.geoPath()
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
    .style('fill', '#cce5ff') // cor base
    .style('stroke', 'black')
    .on('click', (event, d) => handleClick(event, d, onDataFiltered));

  // ---- Zoom e Pan
  const zoom = d3.zoom()
    .scaleExtent([1, 9])
    .on('zoom', handleZoom);

  svg.call(zoom);
}

export function clearMap() {
  selectedIds.clear();
  d3.select('#group')
    .selectAll('path')
    .remove();
}

function handleZoom({ transform }) {
  d3.select('#group')
    .selectAll('path')
    .attr('transform', transform);
}

function handleClick(event, d, onDataFiltered) {
  if (event.target.tagName !== 'path') return;

  const locationId = d.properties.objectid;

  if (event.shiftKey) {
    // Shift = seleção múltipla
    if (selectedIds.has(locationId)) {
      selectedIds.delete(locationId);
    } else {
      selectedIds.add(locationId);
    }
  } else {
    // Clique normal = seleção única
    selectedIds.clear();
    selectedIds.add(locationId);
  }

  // Atualiza visualmente os selecionados
  d3.selectAll('#group path')
    .style('fill', d => {
      const id = d.properties.objectid;
      return selectedIds.has(id) ? 'yellow' : '#cce5ff';
    });

  // Dispara callback com os selecionados
  if (onDataFiltered) {
    onDataFiltered(Array.from(selectedIds));
  }
}
