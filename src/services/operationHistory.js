const STORAGE_KEY = 'slothsync_operation_history';

export const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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

export const addOperation = (operation) => {
  const history = loadHistory();
  const newOperation = {
    ...operation,
    timestamp: Date.now(),
  };
  history.unshift(newOperation);
  saveHistory(history);
  return newOperation;
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};
