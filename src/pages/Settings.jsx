import { useState } from 'react';
import { OllamaService } from '../services/ollama';
import {
  Check,
  CircleAlert,
  CircleCheck,
  Cpu,
  Download,
  ExternalLink,
  Info,
  Moon,
  Palette,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Terminal,
} from 'lucide-react';
import { cx } from '../utils/cx';
import { useTheme } from '../context/ThemeContext';
import { useAIStatus } from '../context/AIStatusContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import Switch from '../components/ui/Switch';

const APP_VERSION = '0.1.0';

const Section = ({ icon, title, description, actions, children }) => (
  <Card>
    <CardHeader icon={icon} title={title} description={description} actions={actions} />
    <CardBody className="pb-6">{children}</CardBody>
  </Card>
);

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const ai = useAIStatus();
  const toast = useToast();

  const [savedEndpoint, setSavedEndpoint] = useState(() => OllamaService.getEndpoint());
  const [savedModel, setSavedModel] = useState(() => OllamaService.getModel());
  const [endpoint, setEndpoint] = useState(() => OllamaService.getEndpoint());
  const [model, setModel] = useState(() => OllamaService.getModel());
  const [models, setModels] = useState([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connection, setConnection] = useState(null);
  const [confirmApply, setConfirmApply] = useState(
    () => localStorage.getItem('slothsync_confirm_apply') !== '0'
  );

  const dirty = endpoint !== savedEndpoint || model !== savedModel;
  const endpointIsLocal = OllamaService.isLocalEndpoint(savedEndpoint);
  const endpointHost = OllamaService.getEndpointHost(savedEndpoint);

  const persist = () => {
    const nextEndpoint = endpoint.trim() || savedEndpoint;
    const nextModel = model.trim() || savedModel;
    OllamaService.setEndpoint(nextEndpoint);
    OllamaService.setModel(nextModel);
    setEndpoint(nextEndpoint);
    setModel(nextModel);
    setSavedEndpoint(nextEndpoint);
    setSavedModel(nextModel);
    return { nextEndpoint, nextModel };
  };

  const handleTest = async () => {
    setTesting(true);
    setConnection(null);
    const result = await OllamaService.testConnection();
    setConnection(result);
    setModels(result.models || []);
    setTesting(false);
    if (result.success) {
      toast.success('Connection successful', `${(result.models || []).length} model(s) available.`);
    } else {
      toast.error('Connection failed', result.error || 'Ollama did not respond.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setConnection(null);
    const { nextEndpoint, nextModel } = persist();
    const result = await OllamaService.testConnection();
    setConnection(result);
    setModels(result.models || []);
    setSaving(false);
    if (result.success) {
      toast.success(
        'Settings saved',
        `${nextEndpoint} reachable · using ${nextModel}.`
      );
    } else {
      toast.error(
        'Settings saved, but the connection failed',
        result.error || 'Ollama did not respond.'
      );
    }
  };

  const selectModel = (name) => {
    setModel(name);
    toast.info('Model selected', `Press Save settings to apply "${name}".`);
  };

  const toggleConfirmApply = (next) => {
    setConfirmApply(next);
    localStorage.setItem('slothsync_confirm_apply', next ? '1' : '0');
    toast.info(
      next ? 'Confirmation enabled' : 'Confirmation disabled',
      next
        ? 'Applying a plan will ask for approval first.'
        : 'Applying a plan will start immediately.'
    );
  };

  return (
    <div className="page">
      <PageHeader
        title="Settings"
        description="Appearance, local AI connection, confirmations and privacy."
        actions={
          <Button icon={Save} loading={saving} onClick={handleSave} disabled={saving}>
            Save settings
          </Button>
        }
      />

      <div className="space-y-6">
        <Section
          icon={Palette}
          title="Appearance"
          description="Choose how SlothSync AI looks. Stored on this device."
        >
          <div role="group" aria-label="Theme" className="inset inline-flex gap-1 rounded-pill p-1">
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
              className={cx(
                'flex items-center gap-2 rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors',
                theme === 'light'
                  ? 'border border-line bg-surface text-ink shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              )}
            >
              <Sun size={14} aria-hidden="true" />
              Light
            </button>
            <button
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
              className={cx(
                'flex items-center gap-2 rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors',
                theme === 'dark'
                  ? 'border border-line bg-surface text-ink shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              )}
            >
              <Moon size={14} aria-hidden="true" />
              Dark
            </button>
          </div>
        </Section>

        <Section
          icon={Cpu}
          title="Local AI (Ollama)"
          description="SlothSync AI talks to Ollama over HTTP for classification and name suggestions."
          actions={
            <Badge
              tone={
                ai.status === 'connected' ? 'success' : ai.status === 'checking' ? 'neutral' : 'danger'
              }
            >
              {ai.status === 'connected'
                ? 'AI connected'
                : ai.status === 'checking'
                  ? 'Checking AI…'
                  : 'AI offline'}
            </Badge>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="settings-endpoint">
                Ollama endpoint
              </label>
              <input
                id="settings-endpoint"
                type="text"
                value={endpoint}
                onChange={(event) => setEndpoint(event.target.value)}
                placeholder="http://localhost:11434"
                className="field-input"
              />
              <p className="mt-1.5 text-xs text-ink-3">Default: http://localhost:11434</p>
            </div>
            <div>
              <label className="field-label" htmlFor="settings-model">
                Model name
              </label>
              <input
                id="settings-model"
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="llama3.2"
                className="field-input mono"
              />
              <p className="mt-1.5 text-xs text-ink-3">Recommended: llama3.2, mistral, gemma2</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={testing}
              disabled={testing || saving}
              onClick={handleTest}
            >
              Test connection
            </Button>
            {dirty ? (
              <Badge tone="warning" icon={Info}>
                Unsaved changes
              </Badge>
            ) : null}
            <span className="text-xs text-ink-3">Tests the saved endpoint.</span>
          </div>

          {connection ? (
            <div
              className={cx(
                'animate-fade-in mt-4 flex items-start gap-3 rounded-ctl border px-4 py-3',
                connection.success
                  ? 'border-success/30 bg-success-soft'
                  : 'border-danger/30 bg-danger-soft'
              )}
              role={connection.success ? 'status' : 'alert'}
            >
              {connection.success ? (
                <CircleCheck size={17} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <CircleAlert size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
              )}
              <p
                className={cx(
                  'text-[13px] leading-relaxed',
                  connection.success ? 'text-success-text' : 'text-danger-text'
                )}
              >
                {connection.success
                  ? `Connected - ${(connection.models || []).length} model(s) available.`
                  : connection.error}
              </p>
            </div>
          ) : null}

          {models.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
                Available models
              </h3>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-ctl border border-line">
                {models.map((entry) => {
                  const name = String(entry.name || '').split(':').pop() || entry.name;
                  const selected = model === entry.name || model === name;
                  return (
                    <li
                      key={entry.name}
                      className="flex flex-wrap items-center gap-3 px-3.5 py-2.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink" title={entry.name}>
                        {entry.name}
                      </span>
                      {entry.size ? (
                        <span className="text-xs tabular-nums text-ink-3">
                          {(entry.size / 1024 / 1024 / 1024).toFixed(2)} GB
                        </span>
                      ) : null}
                      {selected ? (
                        <Badge tone="success" icon={Check}>
                          In use
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => selectModel(entry.name)}>
                          Use model
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 rounded-ctl border border-line bg-surface-2 px-4 py-3.5">
            <h3 className="text-[11px] font-bold tracking-[0.06em] text-ink-3 uppercase">
              Quick setup
            </h3>
            <ol className="mt-2 space-y-2 text-[13px] leading-relaxed text-ink-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 shrink-0 text-center text-xs font-bold text-ink-3">1</span>
                <span>
                  Install Ollama from{' '}
                  <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent-text underline underline-offset-2"
                  >
                    ollama.com
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 shrink-0 text-center text-xs font-bold text-ink-3">2</span>
                <span className="min-w-0">
                  Pull a model in your terminal:
                  <code className="mono mt-1 block truncate rounded-ctl-sm border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink">
                    ollama pull llama3.2
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 shrink-0 text-center text-xs font-bold text-ink-3">3</span>
                <span>
                  Press{' '}
                  <span className="font-medium text-ink">Test connection</span> above to confirm
                  SlothSync AI can reach it.
                </span>
              </li>
            </ol>
          </div>
        </Section>

        <Section
          icon={SlidersHorizontal}
          title="Confirmations"
          description="Control how careful the app is before touching files."
        >
          <Switch
            id="confirm-apply"
            checked={confirmApply}
            onChange={toggleConfirmApply}
            label="Confirm before applying changes"
            description="Show a dialog listing exactly what will change before any file is moved. When off, Apply starts immediately."
          />
        </Section>

        <Section
          icon={ShieldCheck}
          title="Privacy"
          description="What leaves this machine, and what never does."
        >
          <ul className="space-y-3 text-[13px] leading-relaxed text-ink-2">
            <li className="flex items-start gap-2.5">
              <CircleCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              <span>
                Scanning, moving, renaming, undo and duplicate hashing all run locally in the
                desktop app - your files are never uploaded.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CircleCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              <span>
                Scan results, settings and activity history are stored only in this app's local
                storage on this device.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              {endpointIsLocal ? (
                <CircleCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <CircleAlert size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              )}
              <span>
                {endpointIsLocal ? (
                  <>
                    AI requests go to <span className="mono text-ink">{endpointHost}</span> - your
                    local Ollama. File names, extensions, sizes and modified dates are sent there
                    for classification and stay on this machine.
                  </>
                ) : (
                  <>
                    Your endpoint <span className="mono text-ink">{endpointHost}</span> is not on
                    this machine. File names, extensions, sizes and modified dates will be sent
                    there for classification.
                  </>
                )}
              </span>
            </li>
          </ul>
        </Section>

        <Section icon={Info} title="About" description="Build and project details.">
          <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
            <div className="rounded-ctl border border-line bg-surface-2 px-3.5 py-3">
              <dt className="text-xs text-ink-3">Version</dt>
              <dd className="mt-0.5 font-medium text-ink">{APP_VERSION}</dd>
            </div>
            <div className="rounded-ctl border border-line bg-surface-2 px-3.5 py-3">
              <dt className="text-xs text-ink-3">Built for</dt>
              <dd className="mt-0.5 font-medium text-ink">Hacktoberfest 2026 - Week 3</dd>
            </div>
            <div className="rounded-ctl border border-line bg-surface-2 px-3.5 py-3">
              <dt className="text-xs text-ink-3">Theme</dt>
              <dd className="mt-0.5 font-medium text-ink">International Sloth Day</dd>
            </div>
            <div className="rounded-ctl border border-line bg-surface-2 px-3.5 py-3">
              <dt className="text-xs text-ink-3">Stack</dt>
              <dd className="mt-0.5 font-medium text-ink">Tauri · React · Ollama</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-3">
            <Terminal size={14} aria-hidden="true" />
            <span>Everything runs on your machine.</span>
            <Download size={14} aria-hidden="true" />
            <span>No accounts, no telemetry.</span>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Settings;
