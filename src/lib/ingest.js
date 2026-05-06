import { parseCsv, parseJson, inferColumnTypes } from './csv';
import { id } from './id';

function baseName(name) {
  return name.replace(/\.[^.]+$/, '');
}

function extOf(name) {
  return (name.split('.').pop() || '').toLowerCase();
}

async function rowsFromText(text, ext) {
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    const parsed = await parseCsv(text);
    return parsed.data;
  }
  if (ext === 'json') return parseJson(text);
  throw new Error(`Unsupported file type: .${ext}`);
}

export async function ingestFile(file, addDataset) {
  const ext = extOf(file.name);
  let rows;
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    rows = (await parseCsv(file)).data;
  } else if (ext === 'json') {
    rows = parseJson(await file.text());
  } else {
    throw new Error(`Unsupported file type: .${ext}`);
  }
  const datasetId = id('ds');
  addDataset(
    datasetId,
    {
      name: baseName(file.name),
      columns: inferColumnTypes(rows),
      rowCount: rows.length,
      sourceFile: file.name,
    },
    rows
  );
  return datasetId;
}

export async function ingestUrl(url, displayName, addDataset) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  const text = await res.text();
  const ext = extOf(url);
  const rows = await rowsFromText(text, ext);
  const datasetId = id('ds');
  addDataset(
    datasetId,
    {
      name: displayName,
      columns: inferColumnTypes(rows),
      rowCount: rows.length,
      sourceFile: url.split('/').pop(),
    },
    rows
  );
  return datasetId;
}

export async function ingestImageFile(file, addImageRef) {
  const blobURL = URL.createObjectURL(file);
  const dims = await new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      resolve({ width: null, height: null });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = blobURL;
  });
  const imageRefId = id('img');
  addImageRef(
    imageRefId,
    {
      name: baseName(file.name),
      mime: file.type || 'image/png',
      sourceFile: file.name,
      width: dims.width,
      height: dims.height,
    },
    blobURL
  );
  return imageRefId;
}
