export function getDropdownValues() {
  const variableSelect = document.querySelector('#variable-select');
  const aggregationSelect = document.querySelector('#aggregation-select');

  const variable = variableSelect ? variableSelect.value : null;
  const aggregation = aggregationSelect ? aggregationSelect.value : null;

  return { variable, aggregation };
}
