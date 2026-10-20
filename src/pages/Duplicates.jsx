import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, CircleCheck, Copy, FolderOpen, Fingerprint, RefreshCw } from 'lucide-react';
import { findDuplicates } from '../services/duplicateDetector';
import { formatDate, formatFileSize } from '../utils/categorization';
import { loadDuplicateGroups, loadScanResult, saveDuplicateGroups } from '../utils/state';
import { formatRelativeTime } from '../utils/time';
import { useToast } from '../context/ToastContext';
import Button, { Spinner } from '../components/ui/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import StatTile from '../components/ui/StatTile';
import Badge from '../components/ui/Badge';
import FileIcon from '../components/ui/FileIcon';

const MAX_GROUPS = 100;
const wastedBytes = (group) => group.size * Math.max(0, group.files.length - 1);

const byNewestWaste = (a, b) => wastedBytes(b) - wastedBytes(a);

const Duplicates = () => {
  const toast = useToast();
  const [scanResult] = useState(() => loadScanResult());
  const [groups, setGroups] = useState(() => loadDuplicateGroups());
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const files = useMemo(
    () => (scanResult?.files || []).filter((file) => file.is_file),
    [scanResult]
  );

  const sortedGroups = useMemo(
    () => (groups ? [...groups].sort(byNewestWaste) : []),
    [groups]
  );

  const stats = useMemo(() => {
    if (!sortedGroups.length) return null;
    const wasted = sortedGroups.reduce((sum, group) => sum + wastedBytes(group), 0);
    const involved = sortedGroups.reduce((sum, group) => sum + group.files.length, 0);
    return { wasted, involved, count: sortedGroups.length };
  }, [sortedGroups]);

  const handleFind = async () => {
    if (files.length === 0 || scanning) return;
    setScanning(true);
    setError('');
    try {
      const result = await findDuplicates(files);
      const sorted = [...result].sort(byNewestWaste);
      setGroups(sorted);
      saveDuplicateGroups(sorted);
      if (sorted.length > 0) {
        const involved = sorted.reduce((sum, group) => sum + group.files.length, 0);
        toast.success(
          `${sorted.length} duplicate group${sorted.length === 1 ? '' : 's'} found`,
          `${involved.toLocaleString()} files share identical content.`
        );
      } else {
        toast.info('No duplicates found', 'Every file in this scan has unique content.');
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Unexpected error';
      setError(message);
      toast.error('Duplicate scan failed', message);
    } finally {
      setScanning(false);
    }
  };

  if (!scanResult?.rootPath || files.length === 0) {
    return (
      <div className="page">
        <PageHeader
          title="Duplicate Finder"
          description="Find exact copies of files by comparing their content hashes."
        />
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="No scan to work from"
            description="Duplicate detection runs over your last scan. Choose a folder and scan it first."
            action={
              <Link to="/scan" className="btn btn-primary btn-md">
                <FolderOpen size={16} aria-hidden="true" />
                <span>Choose a folder</span>
              </Link>
            }
            secondaryAction={
              <Link to="/" className="btn btn-secondary btn-md">
                Back to dashboard
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const rootPath = scanResult.rootPath;
  const runLabel = groups === null ? 'Find duplicates' : 'Run again';

  return (
    <div className="page">
      <PageHeader
        title="Duplicate Finder"
        description="Finds exact copies by hashing every file with SHA-256. Files are compared by content, not by name or size."
        actions={
          <Button icon={groups === null ? Copy : RefreshCw} loading={scanning} onClick={handleFind}>
            {runLabel}
          </Button>
        }
      />

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
              Last scan
            </p>
            <p className="mono mt-1 truncate text-sm font-medium text-ink" title={rootPath}>
              {rootPath}
            </p>
            <p className="mt-1 text-xs text-ink-3">
              {files.length.toLocaleString()} files to hash
              {scanResult.scannedAt ? ` · scanned ${formatRelativeTime(scanResult.scannedAt)}` : ''}
            </p>
          </div>
          <Badge tone="neutral" icon={Fingerprint}>
            SHA-256 content hashing
          </Badge>
        </CardBody>
      </Card>

      {error ? (
        <div
          className="animate-fade-in mb-6 flex items-start gap-3 rounded-card border border-danger/30 bg-danger-soft px-4 py-3.5"
          role="alert"
        >
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger-text">Duplicate scan failed</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError('')}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {scanning ? (
        <Card className="animate-fade-in mb-6">
          <CardBody className="py-5">
            <div className="flex items-center gap-3">
              <Spinner size={18} className="text-accent-text" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Hashing {files.length.toLocaleString()} files…
                </p>
                <p className="text-[13px] text-ink-2">
                  Reading every file with SHA-256. Large folders take a while.
                </p>
              </div>
            </div>
            <div className="bar-indeterminate mt-3" aria-hidden="true">
              <span />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {groups === null && !scanning && error === '' ? (
        <Card>
          <EmptyState
            tone="accent"
            icon={Fingerprint}
            title="Find exact copies"
            description={`Every one of the ${files.length.toLocaleString()} scanned files is hashed and compared. Groups of files with identical content appear here. Nothing is ever deleted automatically.`}
            action={
              <Button icon={Copy} onClick={handleFind}>
                Find duplicates
              </Button>
            }
          />
        </Card>
      ) : null}

      {groups !== null && !scanning && error === '' && stats === null ? (
        <Card>
          <EmptyState
            tone="accent"
            icon={CircleCheck}
            title="No duplicates found"
            description={`All ${files.length.toLocaleString()} files in this scan have unique content. Nothing to clean up here.`}
            action={
              <Button variant="secondary" icon={RefreshCw} onClick={handleFind}>
                Run again
              </Button>
            }
            secondaryAction={
              <Link to="/scan" className="btn btn-secondary btn-md">
                Scan another folder
              </Link>
            }
          />
        </Card>
      ) : null}

      {stats ? (
        <>
          <div className="stagger mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatTile
              icon={Copy}
              label="Duplicate groups"
              value={stats.count.toLocaleString()}
              hint="Identical content sets"
            />
            <StatTile
              icon={Fingerprint}
              label="Space wasted"
              value={formatFileSize(stats.wasted)}
              hint="Copy of each group"
            />
            <StatTile
              icon={FolderOpen}
              label="Files involved"
              value={stats.involved.toLocaleString()}
              hint="Across all groups"
            />
          </div>

          <div className="space-y-5">
            {sortedGroups.slice(0, MAX_GROUPS).map((group) => (
              <Card key={group.hash}>
                <CardHeader
                  icon={Copy}
                  title={`${group.files.length} identical files · ${formatFileSize(group.size)} each`}
                  description={`SHA-256 ${group.hash.slice(0, 24)}… · listing oldest first`}
                  actions={<Badge tone="warning">{formatFileSize(wastedBytes(group))} wasted</Badge>}
                />
                <CardBody>
                  <ul className="divide-y divide-line overflow-hidden rounded-ctl border border-line">
                    {[...group.files]
                      .sort((a, b) => a.modified - b.modified)
                      .map((file) => (
                        <li key={file.path} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
                          <FileIcon extension={file.extension} size="sm" />
                          <div className="min-w-0 flex-1">
                            <span
                              className="block truncate text-sm font-medium text-ink"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span
                              className="mono block truncate text-[11px] text-ink-3"
                              title={file.path}
                            >
                              {file.path}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-ink-3">
                            {formatDate(file.modified)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>

          {sortedGroups.length > MAX_GROUPS ? (
            <p className="mt-4 text-xs text-ink-3">
              Showing the {MAX_GROUPS} largest groups of {sortedGroups.length.toLocaleString()}.
            </p>
          ) : null}

          <div className="mt-6 flex items-start gap-2 rounded-card border border-line bg-surface-2 px-4 py-3.5 text-xs leading-relaxed text-ink-3">
            <Fingerprint size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Duplicate Finder only reports. It never deletes files - remove copies through the
              organize plan or your file manager.
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Duplicates;
