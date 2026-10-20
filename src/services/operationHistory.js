const STORAGE_KEY = 'slothsync_operation_history';
const MAX_ENTRIES = 200;

export const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const addOperation = (operation) => {
  const history = loadHistory();
  const entry = {
    id: createId(),
    timestamp: Date.now(),
    ...operation,
  };
  history.unshift(entry);
  saveHistory(history.slice(0, MAX_ENTRIES));
  return entry;
};

export const patchOperation = (target, patch) => {
  const history = loadHistory();
  const index = history.findIndex((operation) =>
    target.id ? operation.id === target.id : operation.timestamp === target.timestamp
  );
  if (index === -1) return null;
  history[index] = { ...history[index], ...patch };
  saveHistory(history);
  return history[index];
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

const LEGACY_REVERSIBLE_TYPES = ['move', 'rename'];

export const getOperationItems = (operation) => {
  if (Array.isArray(operation.items) && operation.items.length > 0) {
    return operation.items;
  }
  if (operation.source && operation.destination) {
    return [{ source: operation.source, destination: operation.destination }];
  }
  return [];
};

export const isReversible = (operation) => {
  if (operation.undone) return false;
  if (typeof operation.reversible === 'boolean') {
    return operation.reversible && getOperationItems(operation).length > 0;
  }
  // Legacy entries created before batch operations existed.
  return Boolean(
    operation.success &&
      LEGACY_REVERSIBLE_TYPES.includes(operation.operation_type) &&
      operation.source &&
      operation.destination
  );
};

export const getOperationTitle = (operation) => {
  if (operation.label) return operation.label;
  const type = String(operation.operation_type || 'operation')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const getOperationStatus = (operation) => {
  if (operation.undone) return 'undone';
  if (operation.status) return operation.status;
  if (Array.isArray(operation.items) && operation.items.length > 0) {
    const failed = operation.items.filter((item) => item.error).length;
    if (failed === 0) return 'success';
    if (failed < operation.items.length) return 'partial';
    return 'failed';
  }
  return operation.success ? 'success' : 'failed';
};

export const getAffectedCount = (operation) => {
  if (typeof operation.fileCount === 'number') return operation.fileCount;
  return Math.max(1, getOperationItems(operation).filter((item) => !item.error).length);
};
