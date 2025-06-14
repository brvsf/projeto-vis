import * as d3 from 'd3';

export async function DataWeekend(data) {
  const weekEnd = ["Weekday", "Weekend"];

  data = data.map(d => ({
    ...d,
    is_weekend: weekEnd[d.is_weekend]
  }));

return data;
}

export async function DataDays(data) {
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  data = data.map(d => ({
    ...d,
    weekday: weekDays[d.weekday]
  }));

  return data;
}

export async function groupedData(data, groupKey, valueKey) {
    const groupedData = Array.from(d3.group(data, d => d[groupKey]), ([key, values]) => {
      const sorted = values.map(d => +d[valueKey]).sort(d3.ascending);
      const q1 = d3.quantile(sorted, 0.25);
      const q2 = d3.quantile(sorted, 0.5);
      const q3 = d3.quantile(sorted, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(d3.min(sorted), q1 - 1.5 * iqr);
      const max = Math.min(d3.max(sorted), q3 + 1.5 * iqr);
      const outliers = sorted.filter(v => v < min || v > max);
      return { key, q1, q2, q3, min, max, outliers };
    }
  );
  return groupedData
}

export function parseDate(data) {
  const parseTime = d3.timeParse("%Y-%m-%d");
  return {
    ...data,
    date: parseTime(data.date)
  };
}

export function formatK(value) {
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }

  if (value % 1 !== 0) {
    return parseFloat(value).toFixed(2)
  }

  return value.toString();
}
