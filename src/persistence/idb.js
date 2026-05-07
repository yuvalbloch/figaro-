import { SCHEMA_VERSION } from '@/persistence/schema';

const DB_NAME = 'figaro';
const DB_VERSION = 1;
const SESSION_STORE = 'session';
const FILES_STORE = 'files';
const SESSION_KEY = 'current';

let _db = null;

async function openDB() {
  if (_db) return _db;
  _db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) db.createObjectStore(SESSION_STORE);
      if (!db.objectStoreNames.contains(FILES_STORE)) db.createObjectStore(FILES_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
  return _db;
}

function idbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName).objectStore(storeName).get(key);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function idbPut(db, storeName, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

// Serialize and save the entire session + loaded file data to IndexedDB.
export async function persistSession(state) {
  if (!state.layout || state.layout.rows === 0) return;

  const session = {
    schemaVersion: SCHEMA_VERSION,
    meta: { ...state.meta, modifiedAt: new Date().toISOString() },
    canvas: state.canvas,
    layout: state.layout,
    panels: state.panels,
    plots: state.plots,
    datasets: state.datasets,
    imageRefs: state.imageRefs,
    theme: state.theme,
    labeling: state.labeling,
    customPalette: state.customPalette,
  };

  // Collect file data before opening IDB transactions (fetch is async).
  const fileEntries = [];
  for (const [fileId, loaded] of Object.entries(state._loaded || {})) {
    if (loaded?.rows) {
      fileEntries.push([fileId, { type: 'dataset', rows: loaded.rows }]);
    } else if (loaded?.blobURL) {
      try {
        const blob = await fetch(loaded.blobURL).then((r) => r.blob());
        fileEntries.push([fileId, { type: 'image', blob }]);
      } catch {
        // blob may be revoked; skip silently
      }
    }
  }

  const db = await openDB();
  await idbPut(db, SESSION_STORE, SESSION_KEY, { savedAt: Date.now(), session });
  for (const [key, value] of fileEntries) {
    await idbPut(db, FILES_STORE, key, value);
  }
}

// Load the last auto-saved session and its associated file data from IndexedDB.
// Returns { session, loaded } or null if nothing is saved.
export async function restoreSession() {
  const db = await openDB();
  const record = await idbGet(db, SESSION_STORE, SESSION_KEY);
  if (!record?.session) return null;

  const { session } = record;
  const loaded = {};

  for (const dsId of Object.keys(session.datasets ?? {})) {
    const file = await idbGet(db, FILES_STORE, dsId);
    if (file?.type === 'dataset' && file.rows) {
      loaded[dsId] = { rows: file.rows, blobURL: null };
    }
  }

  for (const imgId of Object.keys(session.imageRefs ?? {})) {
    const file = await idbGet(db, FILES_STORE, imgId);
    if (file?.type === 'image' && file.blob) {
      loaded[imgId] = { rows: null, blobURL: URL.createObjectURL(file.blob) };
    }
  }

  return { session, loaded };
}

// Wipe all persisted data (used when starting a new session explicitly).
export async function clearPersistedSession() {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction([SESSION_STORE, FILES_STORE], 'readwrite');
    tx.objectStore(SESSION_STORE).clear();
    tx.objectStore(FILES_STORE).clear();
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}
