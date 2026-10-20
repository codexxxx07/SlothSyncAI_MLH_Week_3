import { useEffect, useState } from 'react';
import { loadHistory } from '../services/operationHistory';
import { formatFileSize } from '../utils/categorization';
import { FileText, FolderOpen, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const Overview = () => {
  const [stats, setStats] = useState({
    filesScanned: 0,
    filesOrganized: 0,
    duplicateGroups: 0,
    recentOperations: [],
  });

  useEffect(() => {
    const history = loadHistory();
    const organizedCount = history.filter(op => op.success && op.operation_type === 'move').length;
    const recentOps = history.slice(0, 5);

    setStats({
      filesScanned: 0,
      filesOrganized: organizedCount,
      duplicateGroups: 0,
      recentOperations: recentOps,
    });
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay hover:shadow-clay-hover transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-clay-sm ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-deep-charcoal dark:text-off-white">
            {value}
          </div>
          <div className="text-sm text-muted-violet">{label}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-deep-charcoal dark:text-off-white mb-2">
          Welcome to SlothSync AI
        </h2>
        <p className="text-muted-violet">
          Your local-first file organizer powered by open-weight AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Files Scanned"
          value={stats.filesScanned}
          color="bg-muted-violet"
        />
        <StatCard
          icon={FolderOpen}
          label="Files Organized"
          value={stats.filesOrganized}
          color="bg-gentle-mint"
        />
        <StatCard
          icon={Copy}
          label="Duplicate Groups"
          value={stats.duplicateGroups}
          color="bg-lavender"
        />
        <StatCard
          icon={CheckCircle}
          label="Success Rate"
          value="100%"
          color="bg-muted-violet"
        />
      </div>

      <div className="bg-soft-ivory dark:bg-dark-surface rounded-clay p-6 shadow-clay">
        <h3 className="text-xl font-bold text-deep-charcoal dark:text-off-white mb-4">
          Recent Activity
        </h3>
        {stats.recentOperations.length === 0 ? (
          <div className="text-center py-8 text-muted-violet">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No operations yet. Start by scanning a folder!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentOperations.map((op, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-warm-white dark:bg-dark-bg rounded-clay-sm"
              >
                {op.success ? (
                  <CheckCircle size={20} className="text-gentle-mint" />
                ) : (
                  <AlertCircle size={20} className="text-red-500" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-deep-charcoal dark:text-off-white">
                    {op.operation_type}
                  </div>
                  <div className="text-xs text-muted-violet">
                    {new Date(op.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
