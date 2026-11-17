// Penyimpanan IndexedDB sederhana (kapasitasnya jauh lebih besar daripada localStorage).
const DB_NAME = 'bisindo';
const STORE = 'kv';
let dbp = null;

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, fn) {
  dbp = dbp || open();
  return dbp.then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('transaksi dibatalkan'));
  }));
}

export const dbGet = (key) => run('readonly', (s) => s.get(key));
export const dbSet = (key, value) => run('readwrite', (s) => s.put(value, key));
