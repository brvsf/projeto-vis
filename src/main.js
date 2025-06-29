import { loadMap } from './map';
import { linePlot, donutPlot } from './filters.js';
import { histPlot } from './charts.js';
import { Taxi } from './taxi';
import { getDropdownValues } from './utils.js';

const taxi = new Taxi();
const selectedIds = new Set();
let brushDates = { startDate: null, endDate: null };
let selectedHours = new Set();

function onBrush(startDate, endDate) {
  brushDates = { startDate, endDate };

  if (startDate && endDate) {
    taxi.queryInfoByHour('*', 'COUNT', startDate, endDate).then((hourData) => {
      donutPlot(hourData, onDonutClick, selectedHours);
    });
  } else {
    taxi.queryInfoByHour().then((allHoursData) => {
      donutPlot(allHoursData, onDonutClick, selectedHours);
    });
  }
  loadCharts();
}

function onDonutClick(newSelection) {
  selectedHours = newSelection;
  loadCharts();
}

async function loadFilters() {

  const locationFilter = Array.from(selectedIds);

  const countByDay = await taxi.queryInfoByDate(locationFilter);
  linePlot(countByDay, { left: 35, right: 15, top: 10, bottom: 20 }, onBrush);

  const hourData = await taxi.queryInfoByHour();
  donutPlot(hourData, onDonutClick, selectedHours);

}

async function loadCharts() {
  const locationFilter = Array.from(selectedIds);
  const { startDate, endDate } = brushDates;
  const hours = Array.from(selectedHours);
  const { variable, aggregation } = getDropdownValues();

  const agreggatedData = await taxi.queryAgreggatedData(
    locationFilter,
    startDate,
    endDate,
    hours,
    variable,
    aggregation
  );

  histPlot(agreggatedData, { left: 25, right: 25, top: 50, bottom: 20 });
}

window.onload = async () => {
  const response = await fetch('00 - data/taxi-zones.json');
  const neighs = await response.json();

  await taxi.init();
  await taxi.loadTaxi();

  await loadMap(neighs, taxi, async (clickedLocationIdList) => {
    selectedIds.clear();
    clickedLocationIdList.forEach(id => selectedIds.add(id));
    await loadFilters();
    await loadCharts();
  });

  await loadFilters();
  await loadCharts();

  document.getElementById('variable-select').addEventListener('change', loadCharts);
  document.getElementById('aggregation-select').addEventListener('change', loadCharts);
};
