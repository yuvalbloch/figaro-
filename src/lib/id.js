const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomChars(n) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[bytes[i] % 32];
  return out;
}

function timeChars() {
  let t = Date.now();
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = ALPHABET[t % 32] + out;
    t = Math.floor(t / 32);
  }
  return out;
}

export function ulid() {
  return timeChars() + randomChars(16);
}

export function id(prefix) {
  return `${prefix}_${ulid()}`;
}
