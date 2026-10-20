import { useState, useEffect } from 'react';
import { OllamaService } from '../services/ollama';
import { CATEGORIES, formatFileSize } from '../utils/categorization';
import { loadScanResult } from '../utils/state';
import { Check, X, RefreshCw, AlertCircle, Zap } from 'lucide-react';

const OrganizationPlan = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const scanResult = loadScanResult();
    if (scanResult) {
      setFiles(scanResult.files);
    }
  }, []);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [error, setError] = useState('');

  const testAIConnection = async () => {
    setAnalyzing(true);
    setError('');

    const result = await OllamaService.testConnection();
    setAiAvailable(result.success);

    if (!result.success) {
      setError('AI connection failed: ' + result.error);
    }

    setAnalyzing(false);
  };

  const handleAnalyzeWithAI = async () => {
    if (!aiAvailable || files.length === 0) return;

    setAnalyzing(true);
    setError('');

    try {
      const results = await OllamaService.batchClassify(files.slice(0, 20));

      const updatedFiles = files.map((file, index) => {
        const aiResult = results[index];
        if (aiResult && aiResult.success) {
          return {
            ...file,
            aiCategory: aiResult.category,
            suggestedFilename: aiResult.suggestedFilename,
            aiExplanation: aiResult.explanation,
            usesAI: true,
          };
        }
        return file;
      });

      setFiles(updatedFiles);
    } catch (err) {
      setError('AI analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleFileApproval = (index) => {
    const updated = [...files];
    updated[index].approved = !updated[index].approved;
    setFiles(updated);
  };

  const updateFileCategory = (index, newCategory) => {
    const updated = [...files];
    updated[index].category = newCategory;
    setFiles(updated);
  };

  const updateSuggestedName = (index, newName) => {
    const updated = [...files];
    updated[index].customName = newName;
    setFiles(updated);
  };

  if (files.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
            Organization Plan
          </h2>
          <p className="text-muted-violet">
            Scan a folder first to generate an organization plan
          </p>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-12 shadow-clay text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-muted-violet opacity-50" />
          <p className="text-muted-violet text-lg">
            No files to organize. Go to the Scan Folders page first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
          Organization Plan
        </h2>
        <p className="text-muted-violet">
          Review and approve the proposed file organization
        </p>
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={testAIConnection}
            disabled={analyzing}
            className="px-4 py-2 bg-muted-violet text-white rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Testing...
              </>
            ) : (
              'Test AI Connection'
            )}
          </button>

          {aiAvailable && (
            <button
              onClick={handleAnalyzeWithAI}
              disabled={analyzing}
              className="px-4 py-2 bg-gentle-mint text-deep-charcoal rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Zap size={18} />
              Analyze with AI
            </button>
          )}

          {error && (
            <div className="flex-1 text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-soft-ivory dark:bg-dark-surface">
              <tr className="text-left text-sm text-muted-violet">
                <th className="pb-3 w-12">Approve</th>
                <th className="pb-3">Original Name</th>
                <th className="pb-3">Suggested Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">AI Info</th>
              </tr>
            </thead>
            <tbody>
              {files.slice(0, 50).map((file, index) => (
                <tr key={index} className="border-t border-neutral-border text-sm">
                  <td className="py-3">
                    <button
                      onClick={() => toggleFileApproval(index)}
                      className={`p-2 rounded-clay-sm transition-all ${
                        file.approved !== false
                          ? 'bg-gentle-mint text-deep-charcoal'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      }`}
                    >
                      {file.approved !== false ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </td>
                  <td className="py-3 text-deep-charcoal dark:text-off-white">
                    {file.name}
                  </td>
                  <td className="py-3">
                    <input
                      type="text"
                      value={file.customName || file.suggestedFilename || file.name}
                      onChange={(e) => updateSuggestedName(index, e.target.value)}
                      className="w-full px-2 py-1 bg-warm-white dark:bg-dark-bg border border-neutral-border rounded-clay-sm text-deep-charcoal dark:text-off-white"
                    />
                  </td>
                  <td className="py-3">
                    <select
                      value={file.category}
                      onChange={(e) => updateFileCategory(index, e.target.value)}
                      className="px-2 py-1 bg-warm-white dark:bg-dark-bg border border-neutral-border rounded-clay-sm text-deep-charcoal dark:text-off-white"
                    >
                      {Object.values(CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-muted-violet">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="py-3">
                    {file.usesAI ? (
                      <div className="text-xs">
                        <div className="text-muted-violet">{file.aiCategory}</div>
                        {file.aiExplanation && (
                          <div className="text-muted-violet/70 mt-1" title={file.aiExplanation}>
                            {file.aiExplanation.slice(0, 30)}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-violet/50">Rule-based</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-border flex justify-end gap-4">
          <button className="px-6 py-3 bg-muted-violet/10 text-muted-violet rounded-clay-sm hover:bg-muted-violet/20 transition-all">
            Reset
          </button>
          <button className="px-6 py-3 bg-muted-violet text-white rounded-clay-sm shadow-clay hover:shadow-clay-hover transition-all">
            Apply Approved Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPlan;
