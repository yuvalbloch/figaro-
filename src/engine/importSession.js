import { validateSession } from '@/persistence/schema';

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
        resolve(session);
      } catch (err) {
        reject(new Error(`Could not read file: ${err.message}`));
      }
    };

    // Resolve null when user cancels the picker without selecting a file
    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => { if (!input.files?.length) resolve(null); }, 300);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
}
