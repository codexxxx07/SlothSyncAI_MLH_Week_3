import { useEffect, useState } from 'react';
import { loadHistory, clearHistory } from '../services/operationHistory';
import { CheckCircle, XCircle, RotateCcw, Trash2, AlertCircle } from 'lucide-react';

const ActivityHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleUndo = (operation) => {
    if (window.confirm(`Undo this ${operation.operation_type} operation?`)) {
      alert('Undo functionality would be implemented here');
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
            Activity History
          </h2>
          <p className="text-muted-violet">
            View and manage your file operation history
          </p>
        </div>

        <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-12 shadow-clay text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-muted-violet opacity-50" />
          <p className="text-muted-violet text-lg">
            No operations recorded yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
            Activity History
          </h2>
          <p className="text-muted-violet">
            View and manage your file operation history
          </p>
        </div>
        <button
          onClick={handleClearHistory}
          className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-clay-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
        >
          <Trash2 size={18} />
          Clear History
        </button>
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
        <div className="space-y-3">
          {history.map((operation, index) => (
            <div
              key={index}
              className="p-4 bg-warm-white dark:bg-dark-bg rounded-clay-sm border border-neutral-border"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {operation.success ? (
                    <CheckCircle size={20} className="text-gentle-mint" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-deep-charcoal dark:text-off-white">
                      {operation.operation_type}
                    </span>
                    <span className="text-xs text-muted-violet">
                      {new Date(operation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {operation.source && (
                    <div className="text-sm text-muted-violet mb-1">
                      From: {operation.source}
                    </div>
                  )}
                  {operation.destination && (
                    <div className="text-sm text-muted-violet">
                      To: {operation.destination}
                    </div>
                  )}
                </div>
                {operation.success && (
                  <button
                    onClick={() => handleUndo(operation)}
                    className="p-2 bg-muted-violet/10 text-muted-violet rounded-clay-sm hover:bg-muted-violet/20 transition-all"
                    title="Undo operation"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
