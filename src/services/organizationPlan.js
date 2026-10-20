import { moveFile } from './fileOrganizer';
import { addOperation } from './operationHistory';

export const basename = (filePath) => String(filePath).split(/[\\/]/).pop() || '';

export const dirname = (filePath) => {
  const parts = String(filePath).split(/[\\/]/);
  parts.pop();
  return parts.join(String(filePath).includes('\\') && !String(filePath).includes('/') ? '\\' : '/');
};

const separatorFor = (basePath) => (String(basePath).includes('\\') && !String(basePath).includes('/') ? '\\' : '/');

export const joinPath = (basePath, ...rest) => {
  const separator = separatorFor(basePath);
  let output = String(basePath).replace(/[\\/]+$/, '');
  for (const part of rest) {
    if (!part) continue;
    output += separator + String(part).replace(/^[\\/]+/, '');
  }
  return output;
};

/**
 * Builds the proposed operation for a single scanned file.
 * Destination: <rootPath>/<category>/<final name>
 */
export const buildOperation = (file, rootPath) => {
  const finalName = String(file.customName || file.suggestedFilename || file.name || '').trim() || file.name;
  const source = file.path;
  const destination = joinPath(rootPath, file.category, finalName);
  const sameLocation = dirname(source) === dirname(destination);
  const renamed = basename(source) !== finalName;
  const unchanged = source === destination;

  let operation = 'move';
  if (unchanged) operation = 'skip';
  else if (renamed && sameLocation) operation = 'rename';
  else if (renamed) operation = 'move+rename';

  return {
    source,
    destination,
    finalName,
    category: file.category,
    originalName: basename(source),
    renamed,
    unchanged,
    operation,
  };
};

export const buildPlan = (files, rootPath) =>
  files.filter((file) => file.is_file).map((file) => buildOperation(file, rootPath));

export const OPERATION_LABELS = {
  move: 'Move',
  rename: 'Rename',
  'move+rename': 'Move & rename',
  skip: 'Already organized',
};

export const applyPlan = async ({ rootPath, operations, onProgress }) => {
  const items = [];
  let organized = 0;
  let renamed = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < operations.length; index += 1) {
    const operation = operations[index];
    onProgress?.({ done: index, total: operations.length, current: operation.originalName });

    if (operation.unchanged) {
      skipped += 1;
      continue;
    }

    try {
      await moveFile(operation.source, operation.destination);
      items.push({
        source: operation.source,
        destination: operation.destination,
        renamed: operation.renamed,
      });
      organized += 1;
      if (operation.renamed) renamed += 1;
    } catch (error) {
      failed += 1;
      items.push({
        source: operation.source,
        destination: operation.destination,
        renamed: operation.renamed,
        error: typeof error === 'string' ? error : error?.message || 'Unknown error',
      });
    }
  }

  onProgress?.({ done: operations.length, total: operations.length, current: null });

  const status = failed === 0 ? 'success' : organized > 0 ? 'partial' : 'failed';
  let entry = null;

  if (organized > 0 || failed > 0) {
    entry = addOperation({
      type: 'organize',
      label:
        organized > 0
          ? `Organized ${organized} file${organized === 1 ? '' : 's'}`
          : 'Organization attempt failed',
      status,
      success: failed === 0,
      fileCount: organized,
      renamedCount: renamed,
      failedCount: failed,
      skippedCount: skipped,
      reversible: organized > 0,
      undone: false,
      rootPath,
      items,
    });
  }

  return { organized, renamed, skipped, failed, items, operation: entry };
};

/**
 * Removes files that were successfully moved out of the stored scan result so
 * the plan never proposes an operation for a path that no longer exists.
 */
export const pruneAppliedFiles = (scanResult, items) => {
  const movedPaths = new Set(items.filter((item) => !item.error).map((item) => item.source));
  if (movedPaths.size === 0) return scanResult;

  const files = scanResult.files.filter(
    (file) => !(file.is_file && movedPaths.has(file.path))
  );
  const removedCount = scanResult.files.length - files.length;

  return {
    ...scanResult,
    files,
    file_count: Math.max(0, (scanResult.file_count || 0) - removedCount),
  };
};
