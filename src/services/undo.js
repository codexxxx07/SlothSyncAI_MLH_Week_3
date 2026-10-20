import { moveFile } from './fileOrganizer';
import { getOperationItems } from './operationHistory';

export const getUndoableItems = (operation) =>
  getOperationItems(operation).filter((item) => item && item.source && item.destination && !item.error);

export const undoOperation = async (operation) => {
  const items = getUndoableItems(operation);
  const failures = [];
  let restored = 0;

  for (const item of items) {
    try {
      await moveFile(item.destination, item.source);
      restored += 1;
    } catch (error) {
      failures.push({
        source: item.source,
        destination: item.destination,
        error: typeof error === 'string' ? error : error?.message || 'Unknown error',
      });
    }
  }

  return {
    attempted: items.length,
    restored,
    failed: failures.length,
    failures,
  };
};
