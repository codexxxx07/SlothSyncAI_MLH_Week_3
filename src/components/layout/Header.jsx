import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, CircleAlert, CircleCheck, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAIStatus } from '../../context/AIStatusContext';
import { PAGE_META } from '../../utils/navigation';
import { cx } from '../../utils/cx';
import { IconButton, Spinner } from '../ui/Button';

const AI_STATUS_LABEL = {
  checking: 'Checking AI…',
  connected: 'AI connected',
  offline: 'AI offline',
};

const Header = () => {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const ai = useAIStatus();

  const meta = PAGE_META[pathname] || { title: '', crumbs: [] };
  const onSettings = pathname === '/settings';

  const aiLabel = AI_STATUS_LABEL[ai.status] || AI_STATUS_LABEL.checking;
  const aiTitle =
    ai.status === 'connected'
      ? `Connected to ${ai.model} at ${ai.endpoint}. Click to re-check.`
      : ai.status === 'offline'
        ? `${ai.error || 'Ollama is not reachable.'} Click to re-check.`
        : 'Testing the local AI connection…';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-5">
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2 text-[13px]">
          {meta.crumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <ChevronRight size={13} className="shrink-0 text-ink-3" aria-hidden="true" />
              ) : null}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="truncate text-ink-2 transition-colors hover:text-ink"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-semibold text-ink" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={ai.refresh}
          className={cx('btn btn-sm', ai.status === 'connected' ? 'btn-soft' : 'btn-ghost')}
          title={aiTitle}
          aria-label={`${aiLabel}. Re-check AI connection`}
        >
          {ai.status === 'checking' ? (
            <Spinner size={14} />
          ) : ai.status === 'connected' ? (
            <CircleCheck size={15} aria-hidden="true" />
          ) : (
            <CircleAlert size={15} aria-hidden="true" />
          )}
          <span>{aiLabel}</span>
        </button>

        <IconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        />

        {!onSettings ? (
          <Link
            to="/settings"
            className="btn btn-ghost icon-btn icon-btn-sm btn-sm"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={17} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
