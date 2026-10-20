import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Copy,
  FolderOpen,
  History,
  Layers,
  RefreshCw,
  Settings as SettingsIcon,
  Sparkles,
  CircleAlert,
  CircleCheck,
  HardDrive,
  Files,
} from 'lucide-react';
import { loadScanResult, loadDuplicateGroups } from '../utils/state';
import { loadHistory, getAffectedCount, getOperationStatus, getOperationTitle } from '../services/operationHistory';
import { formatFileSize } from '../utils/categorization';
import { formatRelativeTime } from '../utils/time';
import { useAIStatus } from '../context/AIStatusContext';
import Button from '../components/ui/Button';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import StatTile from '../components/ui/StatTile';
import Truncated from '../components/ui/Truncated';
import { SlothMark } from '../components/ui/Logo';

const STATUS_BADGES = {
  success: { tone: 'success', label: 'Completed' },
  partial: { tone: 'warning', label: 'Partially completed' },
  failed: { tone: 'danger', label: 'Failed' },
  undone: { tone: 'neutral', label: 'Reverted' },
};

const Overview = () => {
  const navigate = useNavigate();
  const ai = useAIStatus();

  const [scanResult] = useState(() => loadScanResult());
  const [history] = useState(() => loadHistory());
  const [duplicateGroups] = useState(() => loadDuplicateGroups());

  const filesOrganized = history
    .filter((operation) => !operation.undone)
    .reduce((total, operation) => total + (operation.success ? getAffectedCount(operation) : 0), 0);

  const organizedCategories = scanResult
    ? new Set(scanResult.files.filter((file) => file.is_file).map((file) => file.category)).size
    : 0;

  const redundantCopies = Array.isArray(duplicateGroups)
    ? duplicateGroups.reduce((total, group) => total + Math.max(0, group.files.length - 1), 0)
    : 0;

  const recentOperations = history.slice(0, 5);

  const chooseFolder = useCallback(() => {
    navigate('/scan', { state: { autoSelect: true } });
  }, [navigate]);

  return (
    <div className="page">
      {/* Welcome */}
      <section className="card animate-enter relative mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 px-7 py-7">
          <div className="min-w-0 max-w-xl">
            <span className="badge badge-accent mb-4">
              <Sparkles size={12} aria-hidden="true" />
              Local-first file organization
            </span>
            <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink">
              Let&apos;s clear the clutter.
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              Organize your files locally with a little help from AI. You review every proposed
              change before anything moves.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" icon={FolderOpen} onClick={chooseFolder}>
                Choose Folder to Organize
              </Button>
              {scanResult ? (
                <Button size="lg" variant="secondary" icon={Layers} onClick={() => navigate('/plan')}>
                  Review plan
                </Button>
              ) : null}
            </div>
          </div>
          <div
            className="hidden shrink-0 rounded-[22px] border border-accent-line bg-accent-soft px-7 py-6 md:block"
            aria-hidden="true"
          >
            <SlothMark size={96} />
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <div className="stagger mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={Files}
          label="Files scanned"
          value={scanResult ? scanResult.file_count.toLocaleString() : '—'}
          hint={scanResult ? `In ${scanResult.rootPath ? shortName(scanResult.rootPath) : 'the selected folder'}` : 'No folder scanned yet'}
        />
        <StatTile
          icon={HardDrive}
          label="Folder size"
          value={scanResult ? formatFileSize(scanResult.total_size) : '—'}
          hint={scanResult ? `${scanResult.folder_count.toLocaleString()} folders included` : 'Scan a folder to measure it'}
        />
        <StatTile
          icon={Layers}
          label="Files organized"
          value={filesOrganized.toLocaleString()}
          hint={`${history.length} operation${history.length === 1 ? '' : 's'} recorded`}
        />
        <StatTile
          icon={Copy}
          label="Duplicate groups"
          value={
            duplicateGroups === null
              ? '—'
              : duplicateGroups.length.toLocaleString()
          }
          hint={
            duplicateGroups === null
              ? 'Not checked yet'
              : duplicateGroups.length === 0
                ? 'No identical files found'
                : `${redundantCopies} extra cop${redundantCopies === 1 ? 'y' : 'ies'}`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Folder overview */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={FolderOpen}
            title="Folder overview"
            description={
              scanResult
                ? 'Everything below comes from your most recent scan.'
                : 'Pick a folder and SlothSync will profile it locally.'
            }
            actions={
              scanResult ? (
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => navigate('/scan')}>
                  Rescan
                </Button>
              ) : null
            }
          />
          <CardBody>
            {scanResult ? (
              <div className="space-y-4">
                <div className="inset flex items-center gap-3 px-3.5 py-3">
                  <FolderOpen size={16} className="shrink-0 text-accent-text" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
                      Selected folder
                    </p>
                    <Truncated
                      text={scanResult.rootPath || 'Path not recorded for this scan'}
                      className="mono text-[13px] text-ink"
                    />
                  </div>
                  {scanResult.scannedAt ? (
                    <Badge tone="neutral">Scanned {formatRelativeTime(scanResult.scannedAt)}</Badge>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat label="Files" value={scanResult.file_count.toLocaleString()} />
                  <MiniStat label="Folders" value={scanResult.folder_count.toLocaleString()} />
                  <MiniStat label="Size" value={formatFileSize(scanResult.total_size)} />
                  <MiniStat label="Categories" value={organizedCategories.toLocaleString()} />
                </div>
              </div>
            ) : (
              <EmptyState
                compact
                icon={FolderOpen}
                title="No folder selected yet"
                description="Choose a folder to see its file count, size and category breakdown here."
                action={
                  <Button icon={FolderOpen} onClick={chooseFolder}>
                    Choose folder
                  </Button>
                }
              />
            )}
          </CardBody>
          {scanResult ? (
            <CardFooter>
              <span className="text-xs text-ink-3">
                Ready for the next step? Proposed changes are always shown for approval first.
              </span>
              <Link to="/plan" className="btn btn-soft btn-sm">
                Review organization plan
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </CardFooter>
          ) : null}
        </Card>

        {/* Local AI status */}
        <Card>
          <CardHeader
            icon={Sparkles}
            title="Local AI"
            description="Optional smarter categories and filename suggestions via Ollama."
          />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                tone={
                  ai.status === 'connected' ? 'success' : ai.status === 'offline' ? 'warning' : 'neutral'
                }
                icon={ai.status === 'connected' ? CircleCheck : ai.status === 'offline' ? CircleAlert : undefined}
              >
                {ai.status === 'checking' ? 'Checking connection…' : ai.status === 'connected' ? 'Connected' : 'Unavailable'}
              </Badge>
            </div>

            <dl className="space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">Model</dt>
                <dd className="mono truncate font-semibold text-ink">{ai.model}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-2">Endpoint</dt>
                <dd className="mono min-w-0">
                  <Truncated text={ai.endpoint} className="text-right text-ink" />
                </dd>
              </div>
            </dl>

            {ai.status === 'offline' ? (
              <div className="flex items-start gap-2.5 rounded-ctl border border-warning/30 bg-warning-soft px-3 py-2.5 text-[13px] leading-relaxed text-warning-text">
                <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Ollama isn&apos;t responding. Start Ollama, pull a model, then re-check.
                  Scanning and organizing still work without AI.
                </span>
              </div>
            ) : ai.status === 'connected' ? (
              <p className="text-[13px] leading-relaxed text-ink-2">
                Ready. AI analysis only runs when you press <strong>Analyze with AI</strong>.
              </p>
            ) : null}
          </CardBody>
          <CardFooter>
            <span className="text-xs text-ink-3">
              {ai.isLocal ? 'Endpoint runs on this device.' : 'Endpoint is not local.'}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={ai.refresh} disabled={ai.status === 'checking'}>
                Re-check
              </Button>
              <Link to="/settings" className="btn btn-secondary btn-sm">
                <SettingsIcon size={15} aria-hidden="true" />
                Settings
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={History}
            title="Recent activity"
            description="Real operations recorded on this device."
            actions={
              <Link to="/history" className="btn btn-ghost btn-sm">
                View all
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            }
          />
          <CardBody>
            {recentOperations.length === 0 ? (
              <EmptyState
                compact
                icon={History}
                title="Nothing has run yet"
                description="Scans and approved file operations will show up here with their status."
                action={
                  <Button icon={FolderOpen} onClick={chooseFolder}>
                    Start your first scan
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {recentOperations.map((operation) => {
                  const status = STATUS_BADGES[getOperationStatus(operation)] || STATUS_BADGES.success;
                  return (
                    <li key={operation.id || operation.timestamp} className="flex items-center gap-3 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {getOperationTitle(operation)}
                        </p>
                        <p className="text-xs text-ink-3">
                          {getAffectedCount(operation)} file
                          {getAffectedCount(operation) === 1 ? '' : 's'} affected ·{' '}
                          {formatRelativeTime(operation.timestamp)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Duplicates summary */}
        <Card>
          <CardHeader
            icon={Copy}
            title="Duplicate finder"
            description="Exact copies detected by comparing SHA-256 hashes."
          />
          <CardBody>
            {duplicateGroups === null ? (
              <p className="text-[13px] leading-relaxed text-ink-2">
                Not checked for the current scan. Duplicate detection reads files locally and never
                deletes anything.
              </p>
            ) : duplicateGroups.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-ctl border border-success/30 bg-success-soft px-3 py-2.5 text-[13px] leading-relaxed text-success-text">
                <CircleCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>No identical files were found in the last duplicate check.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] leading-relaxed text-ink-2">
                  <strong className="text-ink">{duplicateGroups.length}</strong> group
                  {duplicateGroups.length === 1 ? '' : 's'} of identical files,{' '}
                  <strong className="text-ink">{redundantCopies}</strong> extra cop
                  {redundantCopies === 1 ? 'y' : 'ies'}.
                </p>
                <div className="inset px-3.5 py-3 text-[13px] text-ink-2">
                  Nothing is deleted automatically. You review and decide.
                </div>
              </div>
            )}
          </CardBody>
          <CardFooter className="mt-4">
            <span />
            <Link to="/duplicates" className="btn btn-secondary btn-sm">
              Open duplicate finder
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-ctl border border-line bg-surface-2 px-3 py-2.5">
    <p className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">{label}</p>
    <p className="mt-1 text-[17px] leading-none font-bold tabular-nums text-ink">{value}</p>
  </div>
);

const shortName = (path) => String(path).split(/[\\/]/).filter(Boolean).pop() || path;

export default Overview;
