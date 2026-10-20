import { useState, useEffect } from 'react';
import { OllamaService } from '../services/ollama';
import { CheckCircle, XCircle, RefreshCw, Save, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [endpoint, setEndpoint] = useState(OllamaService.getEndpoint());
  const [model, setModel] = useState(OllamaService.getModel());
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);

    const result = await OllamaService.testConnection();
    setConnectionStatus(result);
    setAvailableModels(result.models || []);

    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    OllamaService.setEndpoint(endpoint);
    OllamaService.setModel(model);
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
          Settings
        </h2>
        <p className="text-muted-violet">
          Configure AI connection and application preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
          <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
            AI Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-deep-charcoal dark:text-off-white mb-2">
                Ollama Endpoint
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-4 py-3 bg-warm-white dark:bg-dark-bg border border-neutral-border rounded-clay-sm text-deep-charcoal dark:text-off-white"
              />
              <p className="text-xs text-muted-violet mt-1">
                Default: http://localhost:11434
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-charcoal dark:text-off-white mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="llama3.2"
                className="w-full px-4 py-3 bg-warm-white dark:bg-dark-bg border border-neutral-border rounded-clay-sm text-deep-charcoal dark:text-off-white"
              />
              <p className="text-xs text-muted-violet mt-1">
                Recommended: llama3.2, mistral, or gemma2
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-6 py-3 bg-muted-violet text-white rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gentle-mint text-deep-charcoal rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            {connectionStatus && (
              <div
                className={`p-4 rounded-clay-sm flex items-center gap-3 ${
                  connectionStatus.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                {connectionStatus.success ? (
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-600 dark:text-red-400" />
                )}
                <span
                  className={
                    connectionStatus.success
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }
                >
                  {connectionStatus.success
                    ? 'Connection successful!'
                    : connectionStatus.error}
                </span>
              </div>
            )}

            {availableModels.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-deep-charcoal dark:text-off-white mb-2">
                  Available Models
                </h4>
                <div className="space-y-2">
                  {availableModels.map((modelItem, index) => (
                    <div
                      key={index}
                      className="p-3 bg-warm-white dark:bg-dark-bg rounded-clay-sm border border-neutral-border"
                    >
                      <div className="text-sm font-medium text-deep-charcoal dark:text-off-white">
                        {modelItem.name}
                      </div>
                      {modelItem.size && (
                        <div className="text-xs text-muted-violet">
                          Size: {(modelItem.size / 1024 / 1024 / 1024).toFixed(2)} GB
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
          <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
            Setup Instructions
          </h3>

          <div className="space-y-4 text-sm text-deep-charcoal dark:text-off-white">
            <div>
              <h4 className="font-medium mb-2">1. Install Ollama</h4>
              <p className="text-muted-violet">
                Download and install Ollama from{' '}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-violet underline"
                >
                  ollama.com
                </a>
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Pull a Model</h4>
              <p className="text-muted-violet mb-2">
                Run this command in your terminal:
              </p>
              <code className="block p-3 bg-warm-white dark:bg-dark-bg rounded-clay-sm border border-neutral-border">
                ollama pull llama3.2
              </code>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Verify Ollama is Running</h4>
              <p className="text-muted-violet">
                Ollama should start automatically. Verify by visiting{' '}
                <a
                  href="http://localhost:11434"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-violet underline"
                >
                  http://localhost:11434
                </a>
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. Test Connection</h4>
              <p className="text-muted-violet">
                Use the "Test Connection" button above to verify SlothSync AI can reach Ollama.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
          <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
            Privacy Information
          </h3>

          <div className="space-y-3 text-sm text-muted-violet">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-gentle-mint mt-0.5" />
              <p>
                All file operations are performed locally on your computer
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-gentle-mint mt-0.5" />
              <p>
                AI inference runs through your local Ollama instance by default
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-gentle-mint mt-0.5" />
              <p>
                No files are uploaded to external servers without your explicit consent
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-muted-violet mt-0.5" />
              <p>
                If you configure a remote Ollama endpoint, file metadata will be sent to that endpoint
              </p>
            </div>
          </div>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
          <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
            About
          </h3>

          <div className="space-y-2 text-sm text-muted-violet">
            <div>
              <span className="font-medium text-deep-charcoal dark:text-off-white">
                Version:
              </span>{' '}
              0.1.0
            </div>
            <div>
              <span className="font-medium text-deep-charcoal dark:text-off-white">
                Built for:
              </span>{' '}
              Hacktoberfest 2026 - Week 3: Slow and Steady
            </div>
            <div>
              <span className="font-medium text-deep-charcoal dark:text-off-white">
                Theme:
              </span>{' '}
              International Sloth Day - Rewarding Laziness with Open-Source AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
