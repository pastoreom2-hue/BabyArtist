/** Lightweight IndexedDB store for saved drawings (dataURL + timestamp). */

export interface StoredDrawing {
  id: string;
  dataUrl: string;
  title: string;
  savedAt: number;
}

const DB_NAME = 'babyartist-drawings';
const DB_VERSION = 1;
const STORE = 'drawings';
const MAX_ITEMS = 48;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export async function saveDrawingToIdb(
  dataUrl: string,
  title: string,
  savedAt = Date.now()
): Promise<StoredDrawing> {
  const db = await openDb();
  const entry: StoredDrawing = {
    id: `art-${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    title,
    savedAt,
  };

  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(entry);
  await txDone(tx);

  // Cap storage — drop oldest beyond MAX_ITEMS
  const all = await listDrawingsFromIdb();
  if (all.length > MAX_ITEMS) {
    const drop = all.slice(MAX_ITEMS);
    const tx2 = db.transaction(STORE, 'readwrite');
    const store = tx2.objectStore(STORE);
    for (const d of drop) store.delete(d.id);
    await txDone(tx2);
  }

  db.close();
  return entry;
}

/** Newest first */
export async function listDrawingsFromIdb(): Promise<StoredDrawing[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);

  const rows = await new Promise<StoredDrawing[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as StoredDrawing[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB getAll failed'));
  });

  await txDone(tx);
  db.close();

  return rows.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteDrawingFromIdb(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(id);
  await txDone(tx);
  db.close();
}

/** One-time import from legacy localStorage `colorjoy-art` if IDB is empty. */
export async function migrateLocalStorageToIdbIfEmpty(
  legacy: Array<{ dataUrl: string; title: string; savedAt: string }>
): Promise<void> {
  const existing = await listDrawingsFromIdb();
  if (existing.length > 0 || legacy.length === 0) return;

  for (const item of legacy.slice(0, MAX_ITEMS)) {
    const ts = Date.parse(item.savedAt) || Date.now();
    await saveDrawingToIdb(item.dataUrl, item.title, ts);
  }
}
