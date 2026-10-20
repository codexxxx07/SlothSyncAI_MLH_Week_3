import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  FolderOpen,
  HardDrive,
  ScanSearch,
  Search,
  ShieldCheck,
  CircleAlert,
} from 'lucide-react';
import { scanDirectory, selectDirectory } from '../services/fileScanner';
import { categorizeByExtension, formatDate, formatFileSize } from '../utils/categorization';
import { loadScanResult, saveScanResult, clearDuplicateGroups } from '../utils/state';
import { formatRelativeTime } from '../utils/time';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Stepper from '../components/ui/Stepper';
import StatTile from '../components/ui/StatTile';
import Badge from '../components/ui/Badge';
import FileIcon from '../components/ui/FileIcon';
import Truncated from '../components/ui/Truncated';
import Spinner from '../components/ui/Spinner';
import { categoryIcon } from '../utils/categoryMeta';

const MAX_ROWS = 200;

const ScanFolders = () => {
  const location = useLocation();
  const toast = useToast();

  const [scanResult, setScanResult] = useState(() => loadScanResult());
  const [selectedPath, setSelectedPath] = useState(() => loadScanResult()?.rootPath || '');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const autoTriggered = useRef(false);

  const handleSelectDirectory = useCallback(async () => {
    try {
      const path = await selectDirectory();
      if (path) {
        setSelectedPath(path);
        setError('');
      }
    } catch (err) {
      if (String(err).toLowerCase().includes('no directory selected')) return;
      console.error('Directory picker failed:', err);
      setError('The folder picker could not be opened. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (location.state?.autoSelect && !autoTriggered.current) {
      autoTriggered.current = true;
      handleSelectDirectory();
    }
  }, [location.state, handleSelectDirectory]);

  const handleScan = async () => {
    if (!selectedPath || scanning) return;

    setScanning(true);
    setError('');

    try {
      const result = await scanDirectory(selectedPath);
      const categorizedFiles = result.files.map((file) => ({
        ...file,
        category: categorizeByExtension(file.extension),
      }));

      const scanData = {
        ...result,
        files: categorizedFiles,
        rootPath: selectedPath,
        scannedAt: Date.now(),
      };

      setScanResult(scanData);
      saveScanResult(scanData);
      clearDuplicateGroups();
      toast.success(
        'Scan complete',
        `${result.file_count.toLocaleString()} files analyzed in ${shortName(selectedPath)}.`
      );
    } catch (err) {
      console.error('Scan failed:', err);
      setError(
        typeof err === 'string'
          ? err
          : 'The folder could not be scanned. Check that it still exists and that you have permission to read it.'
      );
    } finally {
      setScanning(false);
    }
  };

  const categoryStats = useMemo(() => {
    if (!scanResult) return [];
    const counts = new Map();
    for (const file of scanResult.files) {
      if (!file.is_file) continue;
      counts.set(file.category, (counts.get(file.category) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [scanResult]);

  const visibleFiles = useMemo(() => {
    if (!scanResult) return [];
    const needle = query.trim().toLowerCase();

    const filtered = scanResult.files.filter((file) => {
      if (!file.is_file) return false;
      if (categoryFilter !== 'all' && file.category !== categoryFilter) return false;
      if (needle && !file.name.toLowerCase().includes(needle)) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'size') sorted.sort((a, b) => b.size - a.size);
    else if (sortBy === 'newest') sorted.sort((a, b) => b.modified - a.modified);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [scanResult, query, categoryFilter, sortBy]);

  const fileCount = scanResult?.file_count ?? 0;
  const hasFiles = scanResult && fileCount > 0;

  return (
    <div className="page">
      <PageHeader
        title="Organize Files"
        description="Pick a folder, scan it locally, then review what SlothSync suggests before anything changes."
      />

      <Stepper
        steps={[
          { key: 'scan', label: 'Choose & scan', to: '/scan', status: 'current' },
          { key: 'plan', label: 'Review & apply', to: '/plan', status: 'todo' },
        ]}
      />

      {/* Step 1: choose folder */}
      <Card className="animate-enter mb-6">
        <CardHeader
          icon={FolderOpen}
          title="Step 1 - Choose a folder"
          description="SlothSync reads file names, types, sizes and timestamps on this device only."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <p className="field-label">Selected folder</p>
              <div className="inset flex h-11 items-center gap-2.5 px-3.5">
                <FolderOpen size={16} className="shrink-0 text-accent-text" aria-hidden="true" />
                {selectedPath ? (
                  <Truncated text={selectedPath} className="mono text-[13px] text-ink" />
                ) : (
                  <span className="text-[13px] text-ink-3">No folder selected yet</span>
                )}
              </div>
            </div>
            <Button variant="secondary" icon={FolderOpen} onClick={handleSelectDirectory} disabled={scanning}>
              {selectedPath ? 'Change folder' : 'Choose folder'}
            </Button>
            <Button icon={ScanSearch} onClick={handleScan} disabled={!selectedPath || scanning} loading={scanning}>
              {scanning ? 'Scanning…' : 'Scan folder'}
            </Button>
          </div>

          <div className="flex items-start gap-2.5 rounded-ctl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
            <span>
              Scanning runs entirely on this device. File names and folders are never uploaded, and
              no file is moved, renamed or deleted during a scan.
            </span>
          </div>

          {scanning ? (
            <div className="animate-fade-in rounded-ctl border border-accent-line bg-accent-soft px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Spinner size={16} className="text-accent-text" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-accent-text">
                    Scanning {shortName(selectedPath)}…
                  </p>
                  <p className="text-[13px] text-ink-2">
                    Reading file names, sizes and timestamps. Large folders can take a moment.
                  </p>
                </div>
              </div>
              <div className="bar-indeterminate mt-3" aria-hidden="true">
                <span />
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {error ? (
        <div
          className="animate-fade-in mb-6 flex items-start gap-3 rounded-card border border-danger/30 bg-danger-soft px-4 py-3.5"
          role="alert"
        >
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger-text">Scan failed</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{error}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm shrink-0"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {!scanResult && !error ? (
        <Card>
          <EmptyState
            icon={ScanSearch}
            title="No scan yet"
            description="Choose a folder above and press Scan folder. Results - files, categories and sizes - will appear here."
            action={
              <Button icon={FolderOpen} onClick={handleSelectDirectory}>
                Choose folder
              </Button>
            }
          />
        </Card>
      ) : null}

      {scanResult && fileCount === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="This folder has no files"
            description={`${shortName(scanResult.rootPath || selectedPath)} does not contain any files to organize.`}
            action={
              <Button variant="secondary" onClick={handleSelectDirectory}>
                Choose another folder
              </Button>
            }
          />
        </Card>
      ) : null}

      {hasFiles ? (
        <>
          <div className="stagger mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={FileText} label="Files" value={scanResult.file_count.toLocaleString()} />
            <StatTile icon={FolderOpen} label="Folders" value={scanResult.folder_count.toLocaleString()} />
            <StatTile icon={HardDrive} label="Total size" value={formatFileSize(scanResult.total_size)} />
            <StatTile icon={ScanSearch} label="Categories" value={String(categoryStats.length)} />
          </div>

          {/* Category distribution */}
          <Card className="mb-6">
            <CardHeader
              icon={ScanSearch}
              title="Category distribution"
              description="Assigned from file extensions. AI can refine these later."
            />
            <CardBody>
              <ul className="space-y-2.5">
                {categoryStats.map(({ category, count }) => {
                  const Icon = categoryIcon(category);
                  const percent = Math.max(4, Math.round((count / categoryStats[0].count) * 100));
                  return (
                    <li key={category} className="flex items-center gap-3">
                      <Icon size={15} className="w-4 shrink-0 text-ink-3" aria-hidden="true" />
                      <span className="w-44 shrink-0 truncate text-[13px] font-medium text-ink">
                        {category}
                      </span>
                      <span className="progress-track hidden flex-1 sm:block">
                        <span className="progress-fill block" style={{ width: `${percent}%` }} />
                      </span>
                      <span className="ml-auto w-14 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          {/* File list */}
          <Card>
            <CardHeader
              icon={FileText}
              title={`Files (${scanResult.file_count.toLocaleString()})`}
              description="Search, filter and sort before continuing to the plan."
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search files…"
                      aria-label="Search files by name"
                      className="field-input h-9 w-44 pl-8 text-[13px]"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    aria-label="Filter by category"
                    className="field-select h-9 w-44 text-[13px]"
                  >
                    <option value="all">All categories</option>
                    {categoryStats.map(({ category }) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort files"
                    className="field-select h-9 w-40 text-[13px]"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="size">Largest first</option>
                    <option value="newest">Recently modified</option>
                  </select>
                </div>
              }
            />
            <CardBody>
              {visibleFiles.length === 0 ? (
                <EmptyState
                  compact
                  icon={Search}
                  title="No matching files"
                  description="No files match the current search and filters."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setQuery('');
                        setCategoryFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                  secondaryAction={
                    <Link to="/plan" className="btn btn-primary btn-md">
                      Review plan
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="max-h-[440px] overflow-auto rounded-ctl border border-line">
                    <table className="data-table min-w-[620px]">
                      <thead>
                        <tr>
                          <th scope="col">File</th>
                          <th scope="col">Category</th>
                          <th scope="col">Size</th>
                          <th scope="col">Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleFiles.slice(0, MAX_ROWS).map((file) => (
                          <tr key={file.path}>
                            <td>
                                <div className="flex min-w-0 items-center gap-3">
                                  <FileIcon category={file.category} extension={file.extension} size="sm" />
                                  <div className="min-w-0 max-w-[320px]">
                                    <Truncated text={file.name} className="text-sm font-medium text-ink" />
                                    <span className="mono block truncate text-[11px] text-ink-3" title={parentOf(file.path)}>
                                      {parentOf(file.path)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            <td>
                              <Badge tone="neutral" icon={categoryIcon(file.category)}>
                                {file.category}
                              </Badge>
                            </td>
                            <td className="text-ink-2">{formatFileSize(file.size)}</td>
                            <td className="text-ink-2">{formatDate(file.modified)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-ink-3">
                      Showing {Math.min(visibleFiles.length, MAX_ROWS).toLocaleString()} of{' '}
                      {visibleFiles.length.toLocaleString()} matching files
                      {visibleFiles.length > MAX_ROWS ? ` (first ${MAX_ROWS} shown)` : ''}.
                    </p>
                    <Link to="/plan" className="btn btn-primary btn-md">
                      Review organization plan
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </>
              )}
            </CardBody>
            {visibleFiles.length > 0 ? (
              <CardFooter>
                <span className="text-xs text-ink-3">
                  Nothing changes on disk until you approve the plan.
                </span>
                {scanResult.scannedAt ? (
                  <span className="badge badge-neutral">Scanned {formatRelativeTime(scanResult.scannedAt)}</span>
                ) : null}
              </CardFooter>
            ) : null}
          </Card>
        </>
      ) : null}
    </div>
  );
};

const shortName = (path) => String(path || '').split(/[\\/]/).filter(Boolean).pop() || path || '';

const parentOf = (filePath) => {
  const parts = String(filePath).split(/[\\/]/);
  parts.pop();
  const separator = String(filePath).includes('\\') && !String(filePath).includes('/') ? '\\' : '/';
  return parts.join(separator) || '';
};

export default ScanFolders;
