const SCAN_RESULT_KEY = 'slothsync_scan_result';

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
