import { validateSession } from '@/persistence/schema';

async function dataUrlToBlobUrl(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Returns { session, loaded } on success, or null if the user cancelled.
// `loaded` mirrors the _loaded store shape: { [id]: { rows, blobURL } }
export function importSession() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      try {
        const text = await file.text();
        const session = JSON.parse(text);
        const { ok, errors } = validateSession(session);
        if (!ok) {
          reject(new Error(`Invalid session file:\n${errors.join('\n')}`));
          return;
        }

        // Hydrate loaded file data embedded in the session.
        const loaded = {};
        if (session.fileData && typeof session.fileData === 'object') {
          for (const [id, entry] of Object.entries(session.fileData)) {
            if (entry?.type === 'dataset' && Array.isArray(entry.rows)) {
              loaded[id] = { rows: entry.rows, blobURL: null };
            } else if (entry?.type === 'image' && typeof entry.dataUrl === 'string') {
              try {
                loaded[id] = { rows: null, blobURL: await dataUrlToBlobUrl(entry.dataUrl) };
              } catch {
                // Corrupted image entry — skip; user will be prompted to re-link
              }
            }
          }
        }

        resolve({ session, loaded });
      } catch (err) {
        reject(new Error(`Could not read file: ${err.message}`));
      }
    };

    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => { if (!input.files?.length) resolve(null); }, 300);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
}
