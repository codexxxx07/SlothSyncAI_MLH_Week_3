import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  History,
  RotateCcw,
  Trash2,
  TriangleAlert,
  Undo2,
} from 'lucide-react';
import {
  clearHistory,
  getAffectedCount,
  getOperationItems,
  getOperationStatus,
  getOperationTitle,
  isReversible,
  loadHistory,
  patchOperation,
} from '../services/operationHistory';
import { undoOperation } from '../services/undo';
import { formatDateTime, formatRelativeTime } from '../utils/time';
import { cx } from '../utils/cx';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import StatTile from '../components/ui/StatTile';
import Badge from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Modal';

const MAX_DETAIL_ROWS = 50;

const STATUS_META = {
  success: { label: 'Completed', tone: 'success', icon: CircleCheck },
  partial: { label: 'Partial', tone: 'warning', icon: TriangleAlert },
  failed: { label: 'Failed', tone: 'danger', icon: CircleAlert },
  undone: { label: 'Undone', tone: 'neutral', icon: RotateCcw },
};

const ICON_BUBBLES = {
  success: 'border-success/30 bg-success-soft text-success',
  warning: 'border-warning/40 bg-warning-soft text-warning-text',
  danger: 'border-danger/30 bg-danger-soft text-danger-text',
  neutral: 'border-line bg-surface-2 text-ink-3',
};

const ActivityHistory = () => {
  const toast = useToast();
  const [history, setHistory] = useState(loadHistory);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [clearOpen, setClearOpen] = useState(false);
  const [undoTarget, setUndoTarget] = useState(null);
  const [undoing, setUndoing] = useState(false);

  const stats = useMemo(() => {
    const filesMoved = history.reduce((total, entry) => total + getAffectedCount(entry), 0);
    const undoable = history.filter(isReversible).length;
    return { total: history.length, filesMoved, undoable };
  }, [history]);

  const visible = useMemo(
    () =>
      statusFilter === 'all'
        ? history
        : history.filter((entry) => getOperationStatus(entry) === statusFilter),
    [history, statusFilter]
  );

  const entryKey = (entry) => entry.id || `ts-${entry.timestamp}`;

  const runUndo = async () => {
    const operation = undoTarget;
    if (!operation) return;
    setUndoing(true);
    try {
      const res = await undoOperation(operation);
      if (res.restored > 0) {
        patchOperation(operation, { undone: true });
        setHistory((current) =>
          current.map((entry) => (entryKey(entry) === entryKey(operation) ? { ...entry, undone: true } : entry))
        );
        toast.success(
          `${res.restored} file${res.restored === 1 ? '' : 's'} moved back`,
          res.failed > 0
            ? `${res.failed} could not be restored - those files may have been moved since.`
            : 'Everything is back at its original location.'
        );
      } else {
        toast.error('Undo failed', res.failures[0]?.error || 'Files could not be moved back.');
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Unexpected error';
      toast.error('Undo failed', message);
    } finally {
      setUndoing(false);
      setUndoTarget(null);
    }
  };

  const runClear = () => {
    clearHistory();
    setHistory([]);
    setClearOpen(false);
    toast.info('History cleared', 'The operation log was removed. No files were changed.');
  };

  if (history.length === 0) {
    return (
      <div className="page">
        <PageHeader
          title="Activity History"
          description="Every organization run is recorded here, and each one can be undone."
        />
        <Card>
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Operations appear here as soon as you apply an organization plan. Undo restores the exact original locations."
            action={
              <Link to="/scan" className="btn btn-primary btn-md">
                Scan a folder
                <ArrowRight size={16} aria-hidden="true" />
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

  return (
    <div className="page">
      <PageHeader
        title="Activity History"
        description={`${stats.total.toLocaleString()} recorded operation${stats.total === 1 ? '' : 's'}. Undo moves files back exactly where they came from.`}
        actions={
          <Button
            variant="danger-quiet"
            size="sm"
            icon={Trash2}
            onClick={() => setClearOpen(true)}
          >
            Clear history
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-3 gap-4">
        <StatTile icon={History} label="Operations" value={stats.total.toLocaleString()} />
        <StatTile
          icon={ArrowRight}
          label="Files affected"
          value={stats.filesMoved.toLocaleString()}
        />
        <StatTile
          icon={Undo2}
          label="Undoable"
          value={`${stats.undoable.toLocaleString()}`}
          hint={stats.undoable === 0 ? 'Nothing to reverse' : 'Ready to reverse'}
        />
      </div>

      <Card className="mb-6">
        <CardBody className="py-4">
          <div className="flex items-center gap-2.5">
            <label className="shrink-0 text-[13px] text-ink-2" htmlFor="history-filter">
              Show
            </label>
            <select
              id="history-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="field-select h-9 w-44 text-[13px]"
            >
              <option value="all">All operations</option>
              <option value="success">Completed</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
              <option value="undone">Undone</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            compact
            icon={History}
            title="No matching operations"
            description="Nothing in the log has this status."
            action={
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                Show all operations
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((entry) => {
            const status = getOperationStatus(entry);
            const meta = STATUS_META[status] || STATUS_META.success;
            const StatusIcon = meta.icon;
            const key = entryKey(entry);
            const expanded = expandedId === key;
            const items = getOperationItems(entry);
            const failedCount = items.filter((item) => item.error).length;
            const affected = getAffectedCount(entry);

            return (
              <article key={key} className="card animate-fade-in px-5 py-4">
                <div className="flex flex-wrap items-start gap-4">
                  <span
                    className={cx(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-ctl-sm border',
                      ICON_BUBBLES[meta.tone]
                    )}
                    aria-hidden="true"
                  >
                    <StatusIcon size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{getOperationTitle(entry)}</h3>
                      <Badge tone={meta.tone} icon={meta.icon}>
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-ink-3" title={formatDateTime(entry.timestamp)}>
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        {affected.toLocaleString()} file{affected === 1 ? '' : 's'}
                      </Badge>
                      {entry.renamedCount > 0 ? (
                        <Badge tone="neutral">{entry.renamedCount} renamed</Badge>
                      ) : null}
                      {failedCount > 0 ? (
                        <Badge tone="danger">
                          {failedCount} failed
                        </Badge>
                      ) : null}
                      {entry.rootPath ? (
                        <span className="mono truncate text-[11px] text-ink-3" title={entry.rootPath}>
                          {entry.rootPath}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isReversible(entry) ? (
                      <Button variant="soft" size="sm" icon={Undo2} onClick={() => setUndoTarget(entry)}>
                        Undo
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={expanded ? ChevronUp : ChevronDown}
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : key)}
                    >
                      {expanded ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="mb-2 text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
                      Files ({items.length.toLocaleString()})
                    </p>
                    {items.length === 0 ? (
                      <p className="text-[13px] text-ink-2">No per-file details for this entry.</p>
                    ) : (
                      <>
                        <ul className="divide-y divide-line overflow-hidden rounded-ctl border border-line">
                          {items.slice(0, MAX_DETAIL_ROWS).map((item, index) => (
                            <li key={`${item.source}-${index}`} className="px-3.5 py-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="mono min-w-0 flex-1 truncate text-[12px] text-ink"
                                  title={item.source}
                                >
                                  {item.source}
                                </span>
                                <ArrowRight
                                  size={13}
                                  className="shrink-0 text-ink-3"
                                  aria-hidden="true"
                                />
                                <span
                                  className="mono min-w-0 flex-1 truncate text-[12px] text-ink-2"
                                  title={item.destination}
                                >
                                  {item.destination}
                                </span>
                                {item.error ? (
                                  <Badge tone="danger">failed</Badge>
                                ) : item.renamed ? (
                                  <Badge tone="neutral">renamed</Badge>
                                ) : null}
                              </div>
                              {item.error ? (
                                <p className="mt-1 text-xs text-danger-text">{item.error}</p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                        {items.length > MAX_DETAIL_ROWS ? (
                          <p className="mt-2 text-xs text-ink-3">
                            Showing the first {MAX_DETAIL_ROWS} of {items.length.toLocaleString()}{' '}
                            files.
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={clearOpen}
        title="Clear all history?"
        message="The operation log will be deleted. No files are changed, but you lose the ability to undo past operations from here."
        confirmLabel="Clear history"
        cancelLabel="Keep history"
        tone="danger"
        onConfirm={runClear}
        onCancel={() => setClearOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(undoTarget)}
        title="Move these files back?"
        message={
          undoTarget
            ? `${getAffectedCount(undoTarget).toLocaleString()} file${getAffectedCount(undoTarget) === 1 ? '' : 's'} will be returned to their original locations. Files that were moved or renamed since then cannot be restored and will be reported.`
            : ''
        }
        confirmLabel="Undo changes"
        cancelLabel="Cancel"
        busy={undoing}
        onConfirm={runUndo}
        onCancel={() => setUndoTarget(null)}
      />
    </div>
  );
};

export default ActivityHistory;
