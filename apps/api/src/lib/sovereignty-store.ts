// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORE_PATH = path.join(__dirname, '..', '..', 'data', 'sovereignty-store.json');

function ensureStoreFile() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ consents: {}, exports: {}, deletions: {}, audit: [] }, null, 2));
  }
}

function readStore() {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return { consents: {}, exports: {}, deletions: {}, audit: [] };
  }
}

function writeStore(next) {
  ensureStoreFile();
  fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2));
}

export function pushAudit(entry) {
  const store = readStore();
  store.audit = Array.isArray(store.audit) ? store.audit : [];
  store.audit.push({ ...entry, createdAt: new Date().toISOString() });
  writeStore(store);
}

export function getConsent(userId) {
  const store = readStore();
  return store.consents?.[userId] || null;
}

export function upsertConsent(userId, consentPatch) {
  const store = readStore();
  store.consents = store.consents || {};
  const current = store.consents[userId] || {
    analyticsSharing: false,
    researchParticipation: false,
    communityDataBenefit: false,
    marketingCommunications: false,
    thirdPartySharing: false,
    updatedAt: null,
  };

  const next = {
    ...current,
    ...consentPatch,
    updatedAt: new Date().toISOString(),
  };

  store.consents[userId] = next;
  writeStore(store);
  return next;
}

export function createExportRequest({ exportId, userId, format, includeFiles }) {
  const store = readStore();
  store.exports = store.exports || {};
  store.exports[exportId] = {
    id: exportId,
    userId,
    format,
    includeFiles: Boolean(includeFiles),
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    downloadUrl: null,
    expiresAt: null,
    exportData: null,
    errorMessage: null,
  };
  writeStore(store);
  return store.exports[exportId];
}

export function findInProgressExport(userId) {
  const store = readStore();
  const exportsMap = store.exports || {};
  return Object.values(exportsMap).find((e: any) => e.userId === userId && ['pending', 'processing'].includes(e.status)) || null;
}

export function getExport(exportId) {
  const store = readStore();
  return store.exports?.[exportId] || null;
}

export function updateExport(exportId, patch) {
  const store = readStore();
  if (!store.exports?.[exportId]) return null;
  store.exports[exportId] = { ...store.exports[exportId], ...patch };
  writeStore(store);
  return store.exports[exportId];
}

export function getDeletionRequest(userId) {
  const store = readStore();
  return store.deletions?.[userId] || null;
}

export function upsertDeletionRequest(userId, patch) {
  const store = readStore();
  store.deletions = store.deletions || {};
  const current = store.deletions[userId] || null;
  store.deletions[userId] = { ...(current || {}), ...patch };
  writeStore(store);
  return store.deletions[userId];
}

export default {
  pushAudit,
  getConsent,
  upsertConsent,
  createExportRequest,
  findInProgressExport,
  getExport,
  updateExport,
  getDeletionRequest,
  upsertDeletionRequest,
  STORE_PATH,
};

