import { Order } from '../types';

const DB_NAME = 'PressingProDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('orders'))
        db.createObjectStore('orders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('config'))
        db.createObjectStore('config', { keyPath: 'key' });
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

export async function getAllOrders(): Promise<Order[]> {
  const store = await getStore('orders', 'readonly');
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result as Order[]);
    req.onerror = () => rej(req.error);
  });
}

export async function saveOrder(order: Order): Promise<void> {
  const store = await getStore('orders', 'readwrite');
  return new Promise((res, rej) => {
    const req = store.put(order);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

export async function deleteOrder(id: string): Promise<void> {
  const store = await getStore('orders', 'readwrite');
  return new Promise((res, rej) => {
    const req = store.delete(id);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

export async function getConfig<T>(key: string): Promise<T | null> {
  const store = await getStore('config', 'readonly');
  return new Promise((res, rej) => {
    const req = store.get(key);
    req.onsuccess = () => res(req.result ? (req.result.data as T) : null);
    req.onerror = () => rej(req.error);
  });
}

export async function saveConfig<T>(key: string, data: T): Promise<void> {
  const store = await getStore('config', 'readwrite');
  return new Promise((res, rej) => {
    const req = store.put({ key, data });
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}
