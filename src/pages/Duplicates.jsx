import { useState, useEffect } from 'react';
import { findDuplicates } from '../services/duplicateDetector';
import { formatFileSize, formatDate } from '../utils/categorization';
import { loadScanResult } from '../utils/state';
import { Copy, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

const Duplicates = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const scanResult = loadScanResult();
    if (scanResult) {
      setFiles(scanResult.files);
    }
  }, []);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleFindDuplicates = async () => {
    if (files.length === 0) {
      setError('No files loaded. Scan a folder first.');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const duplicates = await findDuplicates(files);
      setDuplicateGroups(duplicates);
    } catch (err) {
      setError('Failed to find duplicates: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
            Duplicate Files
          </h2>
          <p className="text-muted-violet">
            Scan a folder first to detect duplicate files
          </p>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-12 shadow-clay text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-muted-violet opacity-50" />
          <p className="text-muted-violet text-lg">
            No files to analyze. Go to the Scan Folders page first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
          Duplicate Files
        </h2>
        <p className="text-muted-violet">
          Find and manage duplicate files using file hashing
        </p>
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleFindDuplicates}
            disabled={scanning}
            className="px-6 py-3 bg-muted-violet text-white rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Copy size={20} />
                Find Duplicates
              </>
            )}
          </button>

          {error && (
            <div className="flex-1 text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      {duplicateGroups.length > 0 && (
        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
          <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
            Found {duplicateGroups.length} Duplicate Groups
          </h3>

          <div className="space-y-4">
            {duplicateGroups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="bg-warm-white dark:bg-dark-bg rounded-clay p-4 border border-neutral-border"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Copy size={24} className="text-muted-violet" />
                  <div>
                    <div className="text-sm text-muted-violet">
                      Hash: {group.hash.slice(0, 16)}...
                    </div>
                    <div className="text-lg font-bold text-deep-charcoal dark:text-off-white">
                      {formatFileSize(group.size)} × {group.files.length}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center justify-between p-3 bg-soft-ivory dark:bg-dark-surface rounded-clay-sm"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-deep-charcoal dark:text-off-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-violet">
                          {file.path}
                        </div>
                        <div className="text-xs text-muted-violet">
                          Modified: {formatDate(file.modified)}
                        </div>
                      </div>
                      <button className="p-2 bg-muted-violet/10 text-muted-violet rounded-clay-sm hover:bg-muted-violet/20 transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {duplicateGroups.length === 0 && !scanning && !error && (
        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-12 shadow-clay text-center">
          <Copy size={64} className="mx-auto mb-4 text-muted-violet opacity-50" />
          <p className="text-muted-violet text-lg">
            Click "Find Duplicates" to start scanning
          </p>
        </div>
      )}
    </div>
  );
};

export default Duplicates;
