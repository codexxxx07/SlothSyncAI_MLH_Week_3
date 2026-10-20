const SCAN_RESULT_KEY = 'slothsync_scan_result';
const DUPLICATE_KEY = 'slothsync_duplicate_groups';

export const saveScanResult = (result) => {
  try {
    localStorage.setItem(SCAN_RESULT_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Error saving scan result:', error);
  }
};

export const loadScanResult = () => {
  try {
    const stored = localStorage.getItem(SCAN_RESULT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading scan result:', error);
    return null;
  }
};

export const clearScanResult = () => {
  try {
    localStorage.removeItem(SCAN_RESULT_KEY);
  } catch (error) {
    console.error('Error clearing scan result:', error);
  }
};

export const saveDuplicateGroups = (groups) => {
  try {
    localStorage.setItem(DUPLICATE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving duplicate groups:', error);
  }
};

export const loadDuplicateGroups = () => {
  try {
    const stored = localStorage.getItem(DUPLICATE_KEY);
    // null means "never run for the current scan"; [] means "ran, none found".
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading duplicate groups:', error);
    return null;
  }
};

export const clearDuplicateGroups = () => {
  try {
    localStorage.removeItem(DUPLICATE_KEY);
  } catch (error) {
    console.error('Error clearing duplicate groups:', error);
  }
};
