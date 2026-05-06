// CSV/JSON ingestion for the Data Manager.

import Papa from 'papaparse';

export function parseCsv(input) {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    });
  });
}

export function parseJson(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error('JSON dataset must be an array of row objects');
  }
  if (!data.length || typeof data[0] !== 'object' || data[0] === null) {
    throw new Error('JSON dataset must contain at least one row object');
  }
  return data;
}

export function inferColumnTypes(rows) {
  if (!rows || !rows.length) return [];
  const colSet = new Set();
  const headerScan = Math.min(rows.length, 50);
  for (let i = 0; i < headerScan; i++) {
    if (rows[i]) Object.keys(rows[i]).forEach((k) => colSet.add(k));
  }
  const cols = [...colSet];
  const sample = rows.slice(0, 200);
  return cols.map((name) => {
    let allNumeric = true;
    let sawValue = false;
    for (const r of sample) {
      const v = r?.[name];
      if (v === null || v === undefined || v === '') continue;
      sawValue = true;
      if (typeof v !== 'number' || Number.isNaN(v)) {
        allNumeric = false;
        break;
      }
    }
    return { name, type: sawValue && allNumeric ? 'number' : 'string' };
  });
}
