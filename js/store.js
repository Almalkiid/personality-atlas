// Saved progress (this device only). Every storage call is guarded: private mode or blocked storage must never break the test.
const KEY = 'personality-atlas:progress';

export function createStore(storage) {
  const safe = fn => { try { return fn(); } catch { return null; } };
  const peek = () => {
    const raw = safe(() => storage.getItem(KEY));
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { safe(() => storage.removeItem(KEY)); return null; }
  };
  return {
    peek,
    load(instrument) {
      const s = peek();
      if (!s || s.instrumentId !== instrument.id) return null;
      if (s.itemCount !== instrument.items.length || !Array.isArray(s.answers)) { safe(() => storage.removeItem(KEY)); return null; }
      return s;
    },
    save(state) { safe(() => storage.setItem(KEY, JSON.stringify(state))); },
    clear() { safe(() => storage.removeItem(KEY)); },
  };
}

let local = null;
try { local = globalThis.localStorage ?? null; } catch { local = null; }
export const store = createStore(local ?? { getItem: () => null, setItem() {}, removeItem() {} });
