export function createDropdowns() {
  const containerDireita = document.querySelector('.right-chart');

  if (document.querySelector('.variable-select')) return;

    const container = document.createElement('div');
    container.className = 'selections-container';

    const divVar = document.createElement('div');
    divVar.className = 'selections';

    const selectVar = document.createElement('select');
    selectVar.id = 'variable-select';

  const variables = [
    { value: 'tip_amount', text: 'Tip Amount' },
    { value: 'total_amount', text: 'Total Amount' },
    { value: 'trip_distance', text: 'Trip Distance' },
    { value: 'fare_amount', text: 'Fare Amount' }
  ];

  variables.forEach(v => {
    const option = document.createElement('option');
    option.value = v.value;
    option.textContent = v.text;
    selectVar.appendChild(option);
  });

  divVar.appendChild(selectVar);

  const divMonth = document.createElement('div');
  divMonth.className = 'selections';

  const selectMonth = document.createElement('select');
  selectMonth.id = 'month-select';

  const months = [
    { value: '1', text: 'January' },
    { value: '2', text: 'February' },
    { value: '3', text: 'March' },
    { value: '4', text: 'April' },
    { value: '5', text: 'May' },
    { value: '6', text: 'June' }
  ];

  months.forEach(m => {
    const option = document.createElement('option');
    option.value = m.value;
    option.textContent = m.text;
    selectMonth.appendChild(option);
  });

  divMonth.appendChild(selectMonth);

  container.appendChild(divVar);

  container.appendChild(divMonth);

  containerDireita.appendChild(container);
}

export function removeDropdowns() {
  const container = document.querySelector('.selections-container');
  if (container) {
    const monthDropdown = document.querySelector('#month-select');
    const varDropdown = document.querySelector('#variable-select');
    if (monthDropdown) monthDropdown.remove();
    if (varDropdown) varDropdown.remove();
  }
}

export function createAggregationDropdown() {

  let container = document.querySelector('.selections-container');

  if (!container) {
    const containerDireita = document.querySelector('.right-chart');
    if (!containerDireita) {
      console.warn('Container ".right-chart" não encontrado.');
      return;
    }
    container = document.createElement('div');
    container.className = 'selections-container';
    containerDireita.appendChild(container);
  }

  if (document.querySelector('#aggregation-select')) return;

  const divAgg = document.createElement('div');
  divAgg.className = 'selections';

  const selectAgg = document.createElement('select');
  selectAgg.id = 'aggregation-select';

  const aggregations = [
    { value: 'count', text: 'Count' },
    { value: 'mean', text: 'Mean' },
    { value: 'sum', text: 'Sum' }
  ];

  aggregations.forEach(a => {
    const option = document.createElement('option');
    option.value = a.value;
    option.textContent = a.text;
    selectAgg.appendChild(option);
  });

  divAgg.appendChild(selectAgg);

  container.appendChild(divAgg);
}

export function removeAggregationDropdown() {
  const container = document.querySelector('.selections-container');
  if (container) {
    const aggDropdown = document.querySelector('#aggregation-select');
    if (aggDropdown) aggDropdown.remove();
  }
}
