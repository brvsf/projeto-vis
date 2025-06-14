import { barPlotWeekday, boxPlot, linePlot, clearChart, fullClearChart, barPlotHour, treemapPlot } from './charts';
import { Taxi } from './taxi';
import * as DataUtils from './data.js';
import * as GeneralUtils from './utils.js';

const taxi = new Taxi();

async function main() {
  await taxi.init();
  await taxi.loadTaxi(6);

  const question1 = document.querySelector('#question1');
  const question2 = document.querySelector('#question2');

  const varSelect = document.querySelector('#variable-select');
  const monthSelect = document.querySelector('#month-select');

  if(varSelect && monthSelect) {
    varSelect.addEventListener('change', () => {
      updateCharts(varSelect.value, monthSelect.value);
    });
    monthSelect.addEventListener('change', () => {
      updateCharts(varSelect.value, monthSelect.value);
    });
  }

  question1.addEventListener('click', async () => {

    const subchart = document.querySelector('.subchart');
    if (subchart) {
      const existingBottomChart = document.getElementById('bottom-chart');

      if (!existingBottomChart) {
        subchart.innerHTML = `
          <svg>
            <g id="bottom-chart"></g>
          </svg>
        `;
      }
    }

    fullClearChart();

    GeneralUtils.removeAggregationDropdown();
    GeneralUtils.createDropdowns();

    const varSelect = document.querySelector('#variable-select');
    const monthSelect = document.querySelector('#month-select');

    let weekday_trip_count = await taxi.weekday_trip_count(undefined, "1");
    let weekday_tip_amount = await taxi.weekday_variable(undefined ,"tip_amount", "1");
    let month_data = await taxi.month_data(undefined, "tip_amount", "1");

    weekday_trip_count = await DataUtils.DataDays(weekday_trip_count);
    weekday_tip_amount = weekday_tip_amount.filter(d => d.tip_amount >= 0);
    weekday_tip_amount = await DataUtils.DataDays(weekday_tip_amount);

    let weekday_tip_amount_grouped = await DataUtils.groupedData(weekday_tip_amount, "weekday", "tip_amount");
    month_data = month_data.map(DataUtils.parseDate);

    await barPlotWeekday(weekday_trip_count, "trip_count", "January");
    await boxPlot(weekday_tip_amount_grouped, "tip_amount", "January");
    await linePlot(month_data, "tip_amount", "January");

    if(varSelect && monthSelect) {
      varSelect.addEventListener('change', () => {
        updateCharts(varSelect.value, monthSelect.value);
      });
      monthSelect.addEventListener('change', () => {
        updateCharts(varSelect.value, monthSelect.value);
      });
    }
  });

  question2.addEventListener('click', async () => {

    GeneralUtils.removeDropdowns();
    GeneralUtils.createAggregationDropdown();

    const bottomChartGroup = document.getElementById('bottom-chart');

    if (bottomChartGroup) {
      const svgContainer = bottomChartGroup.closest('svg');
      if (svgContainer) {
        svgContainer.remove();
      }
    }

    const aggSelect = document.querySelector('#aggregation-select');

    if(aggSelect) {
      aggSelect.addEventListener('change', () => {
        updateAggregationCharts(aggSelect.value);
      });
    }

    fullClearChart();

    let tip_amount_per_hour = await taxi.tip_amount_per_hour();
    console.log(tip_amount_per_hour);

    await barPlotHour(tip_amount_per_hour, "count");
    await treemapPlot(tip_amount_per_hour, "count");
  });
}

async function updateCharts(selectedVariable, selectedMonth) {
  clearChart();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = parseInt(selectedMonth) - 1;
  const monthName = monthNames[monthIndex];

  let weekday_trip_count = await taxi.weekday_trip_count(undefined, selectedMonth);
  weekday_trip_count = await DataUtils.DataDays(weekday_trip_count);

  let weekday_variable = await taxi.weekday_variable(undefined, selectedVariable, selectedMonth);
  weekday_variable = weekday_variable.filter(d => d[selectedVariable] >= 0);
  weekday_variable = await DataUtils.DataDays(weekday_variable);
  weekday_variable = await DataUtils.groupedData(weekday_variable, "weekday", selectedVariable);

  let month_data_variable = await taxi.month_data(undefined, selectedVariable, selectedMonth);
  month_data_variable = month_data_variable.map(DataUtils.parseDate);

  await barPlotWeekday(weekday_trip_count, "trip_count", monthName);
  await boxPlot(weekday_variable, selectedVariable, monthName);
  await linePlot(month_data_variable, selectedVariable, monthName);
}

async function updateAggregationCharts(selectedAggregation) {
  clearChart();

  let tip_amount_per_hour = await taxi.tip_amount_per_hour(selectedAggregation);

  await barPlotHour(tip_amount_per_hour, selectedAggregation);
  await treemapPlot(tip_amount_per_hour, selectedAggregation);
}


window.onload = () => {
  main();
};
