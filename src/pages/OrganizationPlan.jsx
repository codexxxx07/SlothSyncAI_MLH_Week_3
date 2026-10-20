import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  FolderCheck,
  FolderOpen,
  Lightbulb,
  ListChecks,
  Minus,
  Pencil,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import { OllamaService } from '../services/ollama';
import {
  OPERATION_LABELS,
  applyPlan,
  buildPlan,
  dirname,
  pruneAppliedFiles,
} from '../services/organizationPlan';
import { isReversible, patchOperation } from '../services/operationHistory';
import { undoOperation } from '../services/undo';
import { loadScanResult, saveScanResult } from '../utils/state';
import { CATEGORIES, formatFileSize } from '../utils/categorization';
import { useToast } from '../context/ToastContext';
import { useAIStatus } from '../context/AIStatusContext';
import Button, { Spinner } from '../components/ui/Button';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Stepper from '../components/ui/Stepper';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import StatTile from '../components/ui/StatTile';
import { ConfirmDialog } from '../components/ui/Modal';

const MAX_PLAN_ROWS = 500;
const AI_LIMIT = 20;
const CATEGORY_VALUES = new Set(Object.values(CATEGORIES));

const STEPS = [
  { key: 'scan', label: 'Scan', status: 'done', to: '/scan' },
  { key: 'review', label: 'Review & apply', status: 'current' },
];

const RESULT_STEPS = [
  { key: 'scan', label: 'Scan', status: 'done', to: '/scan' },
  { key: 'review', label: 'Review & apply', status: 'done' },
];

const loadPlanFiles = () => {
  const stored = loadScanResult();
  if (!stored) return [];
  return stored.files.filter((file) => file.is_file);
};

const OrganizationPlan = () => {
  const toast = useToast();
  const ai = useAIStatus();

  const [scanResult, setScanResult] = useState(() => loadScanResult());
  const [files, setFiles] = useState(loadPlanFiles);
  const [analyzing, setAnalyzing] = useState(false);
  const [checkingAi, setCheckingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const rootPath = scanResult?.rootPath || '';
  const truncated = files.length > MAX_PLAN_ROWS;
  const displayed = useMemo(() => files.slice(0, MAX_PLAN_ROWS), [files]);
  const operations = useMemo(
    () => (rootPath ? buildPlan(displayed, rootPath) : []),
    [displayed, rootPath]
  );

  const conflictsSet = useMemo(() => {
    const counts = new Map();
    displayed.forEach((file, index) => {
      const operation = operations[index];
      if (!operation || file.excluded || operation.unchanged) return;
      counts.set(operation.destination, (counts.get(operation.destination) || 0) + 1);
    });
    const conflicts = new Set();
    displayed.forEach((file, index) => {
      const operation = operations[index];
      if (!operation || file.excluded || operation.unchanged) return;
      if (counts.get(operation.destination) > 1) conflicts.add(operation.source);
    });
    return conflicts;
  }, [displayed, operations]);

  const approvedOperations = useMemo(
    () =>
      operations.filter(
        (operation, index) =>
          !displayed[index].excluded && !operation.unchanged && !conflictsSet.has(operation.source)
      ),
    [operations, displayed, conflictsSet]
  );

  const conflictCount = useMemo(
    () =>
      operations.reduce(
        (total, operation, index) =>
          !displayed[index].excluded &&
          !operation.unchanged &&
          conflictsSet.has(operation.source)
            ? total + 1
            : total,
        0
      ),
    [operations, displayed, conflictsSet]
  );

  const approvedCount = displayed.reduce(
    (total, file, index) =>
      !file.excluded && operations[index] && !operations[index].unchanged ? total + 1 : total,
    0
  );

  const updateFile = (index, patch) =>
    setFiles((current) =>
      current.map((file, position) => (position === index ? { ...file, ...patch } : file))
    );

  const setAllExcluded = (value) => {
    setFiles((current) => current.map((file) => ({ ...file, excluded: value })));
    toast.info(
      value ? 'Selection cleared' : 'All files approved',
      value
        ? 'No changes will be applied until you approve files again.'
        : `${files.length.toLocaleString()} files marked for this run.`
    );
  };

  const resetPlan = () => {
    setFiles((current) =>
      current.map((file) => {
        const next = { ...file };
        delete next.customName;
        delete next.excluded;
        return next;
      })
    );
    toast.info('Plan reset', 'Original names and full selection restored.');
  };

  const handleRecheck = async () => {
    setCheckingAi(true);
    const check = await ai.refresh();
    setCheckingAi(false);
    if (check.success) {
      toast.success('AI service reachable', ai.model ? `Using ${ai.model}.` : 'Ollama responded.');
    } else {
      toast.error('AI service unreachable', check.error || 'Start Ollama and try again.');
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || analyzing) return;
    setAnalyzing(true);
    setAiError('');

    const targets = files.slice(0, AI_LIMIT);
    try {
      const results = await OllamaService.batchClassify(targets);
      const succeeded = results
        .map((entry, index) => (entry && entry.success ? index : -1))
        .filter((index) => index >= 0);

      if (succeeded.length === 0) {
        const reason = results.find((entry) => entry && entry.error)?.error;
        setAiError(
          reason
            ? `AI analysis failed: ${reason}`
            : 'AI analysis failed. Check the model in Settings and that Ollama is running.'
        );
        toast.error('AI analysis failed', 'No files could be classified.');
      } else {
        const ok = new Set(succeeded);
        setFiles((current) =>
          current.map((file, index) => {
            const entry = ok.has(index) ? results[index] : null;
            if (!entry) return file;
            const aiCategory = CATEGORY_VALUES.has(entry.category)
              ? entry.category
              : file.category;
            return {
              ...file,
              category: aiCategory,
              aiCategory,
              suggestedFilename: entry.suggestedFilename || file.suggestedFilename,
              aiExplanation: entry.explanation || '',
              usesAI: true,
            };
          })
        );
        toast.success(
          'AI analysis complete',
          `Classified ${succeeded.length} of ${targets.length} files with ${ai.model || 'the local model'}.`
        );
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Unexpected error';
      setAiError(`AI analysis failed: ${message}`);
      toast.error('AI analysis failed', message);
    } finally {
      setAnalyzing(false);
    }
  };

  const runApply = async () => {
    setConfirmOpen(false);
    setApplying(true);
    setError('');
    const previousScanResult = scanResult;
    const operationsToRun = approvedOperations;
    setProgress({
      done: 0,
      total: operationsToRun.length,
      current: operationsToRun[0]?.originalName || null,
    });

    try {
      const res = await applyPlan({
        rootPath,
        operations: operationsToRun,
        onProgress: setProgress,
      });

      const pruned = pruneAppliedFiles(previousScanResult, res.items);
      setScanResult(pruned);
      saveScanResult(pruned);

      const moved = new Set(res.items.filter((item) => !item.error).map((item) => item.source));
      setFiles((current) => current.filter((file) => !moved.has(file.path)));
      setResult({ ...res, previousScanResult });

      if (res.organized > 0) {
        toast.success(
          `${res.organized} file${res.organized === 1 ? '' : 's'} organized`,
          res.failed > 0
            ? `${res.failed} failed - details shown on screen.`
            : 'Undo is available any time from Activity History.'
        );
      }
      if (res.failed > 0 && res.organized === 0) {
        toast.error('Nothing was organized', res.items.find((item) => item.error)?.error || 'All operations failed.');
      }
    } catch (err) {
      console.error('Apply failed:', err);
      const message = typeof err === 'string' ? err : err?.message || 'Unexpected error';
      setError(message);
      toast.error('Could not apply changes', message);
    } finally {
      setApplying(false);
      setProgress(null);
    }
  };

  const handleApplyClick = () => {
    if (approvedCount === 0 || applying) return;
    const confirmFirst = localStorage.getItem('slothsync_confirm_apply') !== '0';
    if (confirmFirst) setConfirmOpen(true);
    else runApply();
  };

  const runUndo = async () => {
    if (!result?.operation) return;
    setUndoing(true);
    try {
      const res = await undoOperation(result.operation);
      if (res.restored > 0) {
        patchOperation(result.operation, { undone: true });
        if (result.previousScanResult) {
          setScanResult(result.previousScanResult);
          saveScanResult(result.previousScanResult);
          setFiles(result.previousScanResult.files.filter((file) => file.is_file));
        }
        setResult(null);
        toast.success(
          `${res.restored} file${res.restored === 1 ? '' : 's'} moved back`,
          res.failed > 0 ? `${res.failed} could not be moved back.` : 'The plan is ready again.'
        );
      } else {
        toast.error(
          'Undo failed',
          res.failures[0]?.error || 'Files could not be moved back.'
        );
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Unexpected error';
      toast.error('Undo failed', message);
    } finally {
      setUndoing(false);
      setUndoOpen(false);
    }
  };

  if (result) {
    const failedItems = result.items.filter((item) => item.error);
    const headline =
      result.organized > 0
        ? result.failed > 0
          ? `${result.organized} organized, ${result.failed} failed`
          : `${result.organized} file${result.organized === 1 ? '' : 's'} organized`
        : 'No files were moved';
    const reversible = Boolean(result.operation) && isReversible(result.operation);

    return (
      <div className="page">
        <PageHeader
          title="Organization Plan"
          description="Operation finished. Nothing else will run until you start another scan or apply a new plan."
        />
        <Stepper steps={RESULT_STEPS} />

        <Card className="animate-enter">
          <CardHeader
            icon={result.organized > 0 ? CircleCheck : CircleAlert}
            title={headline}
            description={
              result.operation
                ? 'Recorded in Activity History, where you can undo it at any time.'
                : 'Nothing was recorded in history because no file changed.'
            }
          />
          <CardBody>
            <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile icon={FolderCheck} label="Organized" value={result.organized} />
              <StatTile icon={Pencil} label="Renamed" value={result.renamed} />
              <StatTile icon={Minus} label="Already in place" value={result.skipped} />
              <StatTile icon={CircleAlert} label="Failed" value={result.failed} />
            </div>

            {failedItems.length > 0 ? (
              <div className="mt-5 rounded-ctl border border-danger/30 bg-danger-soft px-4 py-3.5">
                <p className="text-sm font-semibold text-danger-text">
                  {failedItems.length} file{failedItems.length === 1 ? '' : 's'} could not be moved
                </p>
                <ul className="mt-2 space-y-1.5">
                  {failedItems.slice(0, 5).map((item) => (
                    <li key={item.source} className="text-[13px] leading-snug text-ink-2">
                      <span className="mono font-medium text-ink">{item.source}</span>
                      <span className="block text-xs text-ink-3">{item.error}</span>
                    </li>
                  ))}
                </ul>
                {failedItems.length > 5 ? (
                  <p className="mt-2 text-xs text-ink-3">
                    And {(failedItems.length - 5).toLocaleString()} more - see Activity History.
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardBody>
          <CardFooter>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/history" className="btn btn-primary btn-md">
                View history &amp; undo
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {reversible ? (
                <Button variant="soft" icon={RotateCcw} onClick={() => setUndoOpen(true)}>
                  Undo this operation
                </Button>
              ) : null}
            </div>
            {files.length > 0 ? (
              <Button variant="secondary" onClick={() => setResult(null)}>
                Review remaining files
              </Button>
            ) : (
              <Link to="/scan" className="btn btn-secondary btn-md">
                Scan another folder
              </Link>
            )}
          </CardFooter>
        </Card>

        <ConfirmDialog
          open={undoOpen}
          title="Move these files back?"
          message={`${result.organized} file${result.organized === 1 ? '' : 's'} will be returned to their original locations. The plan will be rebuilt from the restored scan.`}
          confirmLabel="Undo changes"
          cancelLabel="Keep changes"
          tone="primary"
          busy={undoing}
          onConfirm={runUndo}
          onCancel={() => setUndoOpen(false)}
        />
      </div>
    );
  }

  if (!rootPath || files.length === 0) {
    return (
      <div className="page">
        <PageHeader
          title="Organization Plan"
          description="Review and approve where each file will go before anything changes on disk."
        />
        <Stepper steps={STEPS} />
        <Card>
          <EmptyState
            icon={ScanSearch}
            title="No plan yet"
            description="Scan a folder first. The plan is built from that scan - files, categories and proposed destinations."
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

  const statusLabel =
    ai.status === 'connected' ? 'AI connected' : ai.status === 'checking' ? 'Checking AI…' : 'AI offline';

  return (
    <div className="page">
      <PageHeader
        title="Organization Plan"
        description={`Review and approve the proposed organization for ${files.length.toLocaleString()} file${files.length === 1 ? '' : 's'}.`}
        actions={
          <Link to="/scan" className="btn btn-secondary btn-md">
            Back to scan
          </Link>
        }
      />
      <Stepper steps={STEPS} />

      {error ? (
        <div
          className="animate-fade-in mb-6 flex items-start gap-3 rounded-card border border-danger/30 bg-danger-soft px-4 py-3.5"
          role="alert"
        >
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger-text">Apply failed</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{error}</p>
          </div>
        </div>
      ) : null}

      {aiError ? (
        <div
          className="animate-fade-in mb-6 flex items-start gap-3 rounded-card border border-warning/40 bg-warning-soft px-4 py-3.5"
          role="alert"
        >
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-warning-text">AI problem</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{aiError}</p>
          </div>
        </div>
      ) : null}

      {conflictCount > 0 ? (
        <div
          className="animate-fade-in mb-6 flex items-start gap-3 rounded-card border border-warning/40 bg-warning-soft px-4 py-3.5"
          role="alert"
        >
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-warning-text">
              {conflictCount} proposed change{conflictCount === 1 ? '' : 's'} point to the same
              destination
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
              Adjust the file name or category of the duplicates below to resolve, then apply.
            </p>
          </div>
        </div>
      ) : null}

      {applying && progress ? (
        <Card className="animate-fade-in mb-6">
          <CardBody className="py-5">
            <div className="flex items-center gap-3">
              <Spinner size={18} className="text-accent-text" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Applying {Math.min(progress.done + 1, progress.total)} of {progress.total}…
                </p>
                <p className="truncate text-[13px] text-ink-2">{progress.current || 'Working…'}</p>
              </div>
            </div>
            <div className="progress-track mt-3 block w-full" aria-hidden="true">
              <div
                className="progress-fill"
                style={{ width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%` }}
              />
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
              Organizing
            </p>
            <p className="mono mt-1 truncate text-sm font-medium text-ink" title={rootPath}>
              {rootPath}
            </p>
            <p className="mt-1 text-xs text-ink-3">
              {files.length.toLocaleString()} files in plan · {approvedCount.toLocaleString()}{' '}
              approved{truncated ? ` · showing first ${MAX_PLAN_ROWS}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                ai.status === 'connected' ? 'success' : ai.status === 'checking' ? 'neutral' : 'danger'
              }
            >
              {statusLabel}
            </Badge>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={checkingAi}
              onClick={handleRecheck}
            >
              Re-check
            </Button>
            <Button
              variant="soft"
              icon={Sparkles}
              loading={analyzing}
              disabled={ai.status !== 'connected' || files.length === 0}
              onClick={handleAnalyze}
            >
              Analyze with AI
            </Button>
          </div>
          <p className="flex w-full items-start gap-2 text-xs leading-relaxed text-ink-3">
            <Lightbulb size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            AI reviews up to {AI_LIMIT} files at a time using your local model and can refine
            categories and names. Everything else keeps rule-based categories. You can edit every
            row below before applying.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon={ListChecks}
          title="Proposed changes"
          description="Destination = this folder / category / name. Nothing changes on disk until you apply."
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={() => setAllExcluded(false)}>
                Approve all
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAllExcluded(true)}>
                Cancel selection
              </Button>
            </>
          }
        />
        <CardBody>
          <div className="max-h-[560px] overflow-auto rounded-ctl border border-line">
            <table className="data-table min-w-[940px]">
              <thead>
                <tr>
                  <th scope="col">Apply</th>
                  <th scope="col">File</th>
                  <th scope="col">Proposed change</th>
                  <th scope="col">Category</th>
                  <th scope="col">Size</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((file, index) => {
                  const operation = operations[index];
                  if (!operation) return null;
                  const conflict = conflictsSet.has(operation.source);
                  const checked = !file.excluded && !operation.unchanged;
                  const overridden = file.usesAI && file.aiCategory !== file.category;

                  return (
                    <tr key={file.path} className={file.excluded ? 'opacity-60' : undefined}>
                      <td className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={operation.unchanged || applying}
                          onChange={() => updateFile(index, { excluded: !file.excluded })}
                          aria-label={`Include ${file.name} in this run`}
                          className="h-4 w-4 accent-[var(--c-accent)]"
                        />
                      </td>
                      <td>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="min-w-0 max-w-[260px]">
                            <span
                              className="block truncate text-sm font-medium text-ink"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span
                              className="mono block truncate text-[11px] text-ink-3"
                              title={dirname(file.path)}
                            >
                              {dirname(file.path)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="min-w-[340px]">
                          <div className="flex items-center gap-2">
                            <Badge
                              tone={
                                operation.unchanged
                                  ? 'neutral'
                                  : conflict
                                    ? 'warning'
                                    : 'accent'
                              }
                            >
                              {OPERATION_LABELS[operation.operation]}
                            </Badge>
                            {conflict ? (
                              <span className="text-[11px] font-semibold text-warning-text">
                                Same destination as another file
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className="mono max-w-[170px] shrink-0 truncate rounded-ctl-sm border border-line bg-surface-2 px-2 py-1.5 text-[11px] text-ink-2"
                              title={dirname(operation.destination)}
                            >
                              {operation.category}/
                            </span>
                            <input
                              type="text"
                              value={file.customName ?? operation.finalName}
                              onChange={(event) => updateFile(index, { customName: event.target.value })}
                              onBlur={() => {
                                const value = (file.customName ?? '').trim();
                                if (value === '') updateFile(index, { customName: undefined });
                              }}
                              disabled={operation.unchanged || applying}
                              aria-label={`New file name for ${file.name}`}
                              className="field-input h-8 min-w-0 flex-1 text-[13px]"
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={file.category}
                          onChange={(event) => updateFile(index, { category: event.target.value })}
                          disabled={applying}
                          aria-label={`Category for ${file.name}`}
                          className="field-select h-8 w-44 text-[13px]"
                        >
                          {Object.values(CATEGORIES).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-ink-2">{formatFileSize(file.size)}</td>
                      <td>
                        {file.usesAI ? (
                          overridden ? (
                            <Badge tone="neutral" title={file.aiExplanation || undefined}>
                              Manual override
                            </Badge>
                          ) : (
                            <Badge
                              tone="info"
                              icon={Sparkles}
                              title={file.aiExplanation || 'Suggested by the local AI model'}
                            >
                              AI: {file.aiCategory}
                            </Badge>
                          )
                        ) : (
                          <Badge tone="neutral" title="Category assigned by file extension rules">
                            Rules
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-3">
              {displayed.length.toLocaleString()} of {files.length.toLocaleString()} files shown.
              {truncated ? ` Large plan - the first ${MAX_PLAN_ROWS} are included.` : ''}
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-ink">
              {approvedCount.toLocaleString()} of {displayed.length.toLocaleString()} changes
              approved
            </span>
            {conflictCount > 0 ? (
              <Badge tone="warning">
                {conflictCount} conflict{conflictCount === 1 ? '' : 's'}
              </Badge>
            ) : (
              <Badge tone="success">
                {approvedOperations.length.toLocaleString()} ready to apply
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" icon={RotateCcw} onClick={resetPlan} disabled={applying}>
              Reset
            </Button>
            <Button
              icon={Check}
              onClick={handleApplyClick}
              loading={applying}
              disabled={approvedCount === 0 || conflictCount > 0 || applying}
            >
              Apply {approvedCount.toLocaleString()} change
              {approvedCount === 1 ? '' : 's'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Apply these changes?"
        message={
          <>
            {approvedCount.toLocaleString()} file
            {approvedCount === 1 ? '' : 's'} will be moved into category folders under{' '}
            <span className="mono font-medium text-ink">{rootPath}</span>. Existing files are never
            overwritten - conflicts are reported instead. You can undo everything from Activity
            History.
          </>
        }
        confirmLabel={`Apply ${approvedCount.toLocaleString()} change${approvedCount === 1 ? '' : 's'}`}
        cancelLabel="Not yet"
        busy={applying}
        onConfirm={runApply}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default OrganizationPlan;
