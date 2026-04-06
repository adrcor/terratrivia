const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateId(prefix?: string): string {
  let id = "";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  for (const byte of bytes) {
    id += alphabet[byte % alphabet.length];
  }
  return prefix ? `${prefix}_${id}` : id;
}
