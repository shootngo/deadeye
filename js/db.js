const LS = {
  profiles: "deadeye.profiles.v1",
  sessions: "deadeye.sessions.v1",
  documents: "deadeye.documents.v1",
};

const IDB_NAME = "deadeye-blobs";
const IDB_STORE = "files";

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

let idbPromise = null;

function openIdb() {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbPromise;
}

export async function putBlob(id, blob) {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(IDB_STORE).put(blob, id);
  });
}

export async function getBlob(id) {
  if (!id) return null;
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBlob(id) {
  if (!id) return;
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(IDB_STORE).delete(id);
  });
}

export function listProfiles() {
  return readList(LS.profiles).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function getProfile(id) {
  return listProfiles().find((p) => p.id === id) || null;
}

export function saveProfile(profile) {
  const list = readList(LS.profiles);
  const now = Date.now();
  const next = { ...profile, updatedAt: now, createdAt: profile.createdAt || now };
  const i = list.findIndex((p) => p.id === next.id);
  if (i >= 0) list[i] = next;
  else list.unshift(next);
  writeList(LS.profiles, list);
  return next;
}

export function deleteProfile(id) {
  writeList(
    LS.profiles,
    readList(LS.profiles).filter((p) => p.id !== id),
  );
}

export function listSessions() {
  return readList(LS.sessions).sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0));
}

export function getSession(id) {
  return listSessions().find((s) => s.id === id) || null;
}

export function saveSession(session) {
  const list = readList(LS.sessions);
  const now = Date.now();
  const next = { ...session, updatedAt: now, createdAt: session.createdAt || now };
  const i = list.findIndex((s) => s.id === next.id);
  if (i >= 0) list[i] = next;
  else list.unshift(next);
  writeList(LS.sessions, list);
  return next;
}

export async function deleteSession(id) {
  const session = getSession(id);
  if (session?.photoId) await deleteBlob(session.photoId);
  writeList(
    LS.sessions,
    readList(LS.sessions).filter((s) => s.id !== id),
  );
}

export function listDocuments() {
  return readList(LS.documents).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function getDocument(id) {
  return listDocuments().find((d) => d.id === id) || null;
}

export function saveDocument(doc) {
  const list = readList(LS.documents);
  const now = Date.now();
  const next = { ...doc, updatedAt: now, createdAt: doc.createdAt || now };
  const i = list.findIndex((d) => d.id === next.id);
  if (i >= 0) list[i] = next;
  else list.unshift(next);
  writeList(LS.documents, list);
  return next;
}

export async function deleteDocument(id) {
  const doc = getDocument(id);
  if (doc?.fileId) await deleteBlob(doc.fileId);
  writeList(
    LS.documents,
    readList(LS.documents).filter((d) => d.id !== id),
  );
}

export function lastProfileId() {
  return localStorage.getItem("deadeye.lastProfile") || "";
}

export function setLastProfileId(id) {
  if (id) localStorage.setItem("deadeye.lastProfile", id);
}

/** Compress a camera/file image to a JPEG blob for offline storage. */
export async function compressImage(file, maxEdge = 1400, quality = 0.8) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  return blob || file;
}
