/**
 * ProSpace Storage Layer
 * يستخدم IndexedDB لتخزين الملفات والبيانات محلياً
 */

const DB_NAME = 'ProSpaceDB';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_CATEGORIES = 'categories';
const STORE_SETTINGS = 'settings';

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains(STORE_FILES)) {
        const filesStore = database.createObjectStore(STORE_FILES, { keyPath: 'id' });
        filesStore.createIndex('categoryId', 'categoryId', { unique: false });
        filesStore.createIndex('createdAt', 'createdAt', { unique: false });
        filesStore.createIndex('name', 'name', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORE_CATEGORIES)) {
        database.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
        database.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

function getStore(storeName, mode = 'readonly') {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// ========== Categories ==========
async function getAllCategories() {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function saveCategory(category) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES, 'readwrite');
    const req = store.put(category);
    req.onsuccess = () => resolve(category);
    req.onerror = () => reject(req.error);
  });
}

async function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_CATEGORIES, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== Files ==========
async function getAllFiles() {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FILES);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function getFilesByCategory(categoryId) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FILES);
    if (categoryId === 'all') {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
      return;
    }
    const index = store.index('categoryId');
    const req = index.getAll(categoryId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function saveFile(fileData) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FILES, 'readwrite');
    const req = store.put(fileData);
    req.onsuccess = () => resolve(fileData);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFile(id) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FILES, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getFile(id) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_FILES);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ========== Settings ==========
async function getSetting(key) {
  return new Promise((resolve) => {
    const store = getStore(STORE_SETTINGS);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => resolve(null);
  });
}

async function setSetting(key, value) {
  return new Promise((resolve, reject) => {
    const store = getStore(STORE_SETTINGS, 'readwrite');
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// تهيئة القوائم الافتراضية
async function seedDefaultCategories() {
  const existing = await getAllCategories();
  if (existing.length > 0) return;

  const defaults = [
    { id: 'games', name: 'ألعاب', icon: '🎮', color: '#8b5cf6', order: 1 },
    { id: 'work', name: 'شغل', icon: '💼', color: '#6366f1', order: 2 },
    { id: 'study', name: 'مذاكرة', icon: '📚', color: '#22c55e', order: 3 },
    { id: 'media', name: 'ميديا', icon: '🎬', color: '#f59e0b', order: 4 },
    { id: 'other', name: 'أخرى', icon: '📦', color: '#6b7280', order: 5 },
  ];

  for (const cat of defaults) {
    await saveCategory(cat);
  }
}
