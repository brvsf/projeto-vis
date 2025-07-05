import { loadMap } from './map';
import { lineFilter, donutFilter } from './filters.js';
import { histPlot, linePlot, barPlot } from './charts.js';
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
      donutFilter(hourData, onDonutClick, selectedHours);
    });
  } else {
    taxi.queryInfoByHour().then((allHoursData) => {
      donutFilter(allHoursData, onDonutClick, selectedHours);
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
  lineFilter(countByDay, { left: 35, right: 15, top: 10, bottom: 25 }, onBrush);

  const hourData = await taxi.queryInfoByHour();
  donutFilter(hourData, onDonutClick, selectedHours);

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

  const agregatedByPaymentType = await taxi.queryAgreggatedByPaymentType(
    locationFilter,
    startDate,
    endDate,
    hours,
    variable,
    aggregation
  );

  histPlot(agreggatedData, { left: 30, right: 15, top: 20, bottom: 20 });
  linePlot(agreggatedData, { left: 60, right: 15, top: 20, bottom: 20 });
  barPlot(agregatedByPaymentType, { left: 60, right: 15, top: 20, bottom: 20 });
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
  document.getElementById('reset-button').addEventListener('click', () => {
    selectedIds.clear();
    selectedHours.clear();
    brushDates = { startDate: null, endDate: null };
    loadMap(neighs, taxi, async (clickedLocationIdList) => {
      selectedIds.clear();
      clickedLocationIdList.forEach(id => selectedIds.add(id));
      await loadFilters();
      await loadCharts();
    });
    loadFilters();
    loadCharts();
  });
};
