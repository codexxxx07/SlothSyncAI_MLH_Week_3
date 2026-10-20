import { useState } from 'react';
import { selectDirectory, scanDirectory } from '../services/fileScanner';
import { categorizeByExtension, formatFileSize, formatDate, CATEGORIES } from '../utils/categorization';
import { saveScanResult } from '../utils/state';
import { FolderOpen, FileText, RefreshCw, AlertCircle } from 'lucide-react';

const ScanFolders = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const handleSelectDirectory = async () => {
    try {
      const path = await selectDirectory();
      setSelectedPath(path);
      setError('');
    } catch (err) {
      setError('Failed to select directory');
    }
  };

  const handleScan = async () => {
    if (!selectedPath) return;

    setScanning(true);
    setError('');

    try {
      const result = await scanDirectory(selectedPath);

      const categorizedFiles = result.files.map(file => ({
        ...file,
        category: categorizeByExtension(file.extension),
      }));

      const scanData = {
        ...result,
        files: categorizedFiles,
      };

      setScanResult(scanData);
      saveScanResult(scanData);
    } catch (err) {
      setError('Failed to scan directory: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const getCategoryStats = () => {
    if (!scanResult) return {};

    const stats = {};
    scanResult.files.forEach(file => {
      if (file.is_file) {
        stats[file.category] = (stats[file.category] || 0) + 1;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
          Scan Folders
        </h2>
        <p className="text-muted-violet">
          Select a directory to analyze files and generate an organization plan
        </p>
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-deep-charcoal dark:text-off-white mb-2">
              Selected Directory
            </label>
            <div className="p-3 bg-warm-white dark:bg-dark-bg rounded-clay-sm border border-neutral-border">
              {selectedPath || 'No directory selected'}
            </div>
          </div>
          <button
            onClick={handleSelectDirectory}
            className="px-6 py-3 bg-muted-violet text-white rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2"
          >
            <FolderOpen size={20} />
            Browse
          </button>
          <button
            onClick={handleScan}
            disabled={!selectedPath || scanning}
            className="px-6 py-3 bg-gentle-mint text-deep-charcoal rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <FileText size={20} />
                Scan
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-clay p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {scanResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-4 shadow-clay">
              <div className="text-2xl font-bold text-deep-charcoal dark:text-off-white">
                {scanResult.file_count}
              </div>
              <div className="text-sm text-muted-violet">Total Files</div>
            </div>
            <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-4 shadow-clay">
              <div className="text-2xl font-bold text-deep-charcoal dark:text-off-white">
                {scanResult.folder_count}
              </div>
              <div className="text-sm text-muted-violet">Total Folders</div>
            </div>
            <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-4 shadow-clay">
              <div className="text-2xl font-bold text-deep-charcoal dark:text-off-white">
                {formatFileSize(scanResult.total_size)}
              </div>
              <div className="text-sm text-muted-violet">Total Size</div>
            </div>
            <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-4 shadow-clay">
              <div className="text-2xl font-bold text-deep-charcoal dark:text-off-white">
                {Object.keys(categoryStats).length}
              </div>
              <div className="text-sm text-muted-violet">Categories</div>
            </div>
          </div>

          <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay mb-6">
            <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
              Category Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div
                  key={category}
                  className="p-3 bg-warm-white dark:bg-dark-bg rounded-clay-sm border border-neutral-border"
                >
                  <div className="text-sm font-medium text-deep-charcoal dark:text-off-white">
                    {category}
                  </div>
                  <div className="text-lg font-bold text-muted-violet">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
            <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
              Files ({scanResult.files.length})
            </h3>
            <div className="max-h-96 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-soft-ivory dark:bg-dark-surface">
                  <tr className="text-left text-sm text-muted-violet">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.files.slice(0, 100).map((file, index) => (
                    <tr
                      key={index}
                      className="border-t border-neutral-border text-sm"
                    >
                      <td className="py-2 text-deep-charcoal dark:text-off-white">
                        {file.name}
                      </td>
                      <td className="py-2 text-muted-violet">
                        {file.category}
                      </td>
                      <td className="py-2 text-deep-charcoal dark:text-off-white">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-2 text-muted-violet">
                        {formatDate(file.modified)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {scanResult.files.length > 100 && (
                <div className="text-center py-4 text-muted-violet text-sm">
                  Showing first 100 of {scanResult.files.length} files
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScanFolders;
