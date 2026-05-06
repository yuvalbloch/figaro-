// PapaParse wrapper. Filled in during Phase 3 (Data Manager).

import Papa from 'papaparse';

export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    });
  });
}

export function inferColumnTypes(rows) {
  if (!rows.length) return [];
  const sample = rows[0];
  return Object.keys(sample).map((name) => {
    const values = rows.slice(0, 50).map((r) => r[name]);
    const allNumeric = values.every((v) => v === null || v === undefined || typeof v === 'number');
    return { name, type: allNumeric ? 'number' : 'string' };
  });
}
