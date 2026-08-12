/** `crypto.randomUUID` only exists in secure contexts (HTTPS, or `localhost`) — accessing the dev
 * server over a plain-HTTP LAN address (e.g. testing on a phone via `http://192.168.x.x:5173`)
 * silently leaves it undefined, so every `addElement` call throws and nothing gets added. This
 * degrades to a plain random ID instead of crashing when that API isn't available. Production is
 * served over HTTPS, so `crypto.randomUUID` is used there as before. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
