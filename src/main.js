import { loadMap, clearMap } from './map';
import { linePlot, donutPlot } from './charts';
import { Taxi } from './taxi';
import { getDropdownValues } from './utils.js';

const taxi = new Taxi();
const selectedIds = new Set();

function onBrush(startDate, endDate) {
  if (startDate && endDate) {
    console.log('=== Brush selecionado ===');
    console.log('Intervalo selecionado:', startDate, 'até', endDate);

    taxi.queryInfoByHour('*', 'COUNT', startDate, endDate).then((hourData) => {
      console.log('Dados filtrados por brush (hora):', hourData);
      donutPlot(hourData, onDonutClick, new Set());
    }).catch(err => {
      console.error('Erro na queryInfoByHour dentro do brush:', err);
    });
  } else {
    console.log('=== Brush limpo (sem seleção) ===');
    taxi.queryInfoByHour().then((allHoursData) => {
      console.log('Dados gerais para donut (sem filtro de brush):', allHoursData);
      donutPlot(allHoursData, onDonutClick, new Set());
    }).catch(err => {
      console.error('Erro na queryInfoByHour para dados gerais:', err);
    });
  }
}

function onDonutClick(selectedHours) {
  console.log('Horas selecionadas no donut:', [...selectedHours]);
}

async function loadCharts() {
  try {
    const locationFilter = Array.from(selectedIds);
    console.log('=== Carregando gráficos com filtro de localizações ===');
    console.log('IDs selecionados no mapa:', locationFilter);

    const { variable, aggregation } = getDropdownValues();
    console.log('Variável selecionada:', variable);
    console.log('Agregação selecionada:', aggregation);

    const countByDay = await taxi.queryInfoByDate(locationFilter);
    console.log('Dados filtrados por data (contagem diária):', countByDay);

    linePlot(countByDay, { left: 25, right: 25, top: 10, bottom: 20 }, onBrush);

    const allHoursData = await taxi.queryInfoByHour();
    console.log('Dados gerais para donut plot (antes do filtro do brush):', allHoursData);

    donutPlot(allHoursData, onDonutClick, new Set());
  } catch (err) {
    console.error('Erro ao carregar os gráficos:', err);
  }
}

window.onload = async () => {
  try {
    const response = await fetch('00 - data/taxi-zones.json');
    const neighs = await response.json();

    console.log('Inicializando Taxi...');
    await taxi.init();
    await taxi.loadTaxi();
    console.log('Taxi carregado');

    await loadMap(neighs, taxi, async (clickedLocationIdList) => {
      selectedIds.clear();
      clickedLocationIdList.forEach(id => selectedIds.add(id));
      console.log('IDs selecionados no mapa após clique:', [...selectedIds]);
      await loadCharts();
    });

    await loadCharts();
  } catch (err) {
    console.error('Erro no carregamento inicial:', err);
  }
};
