import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/navigation';
import { cx } from '../../utils/cx';
import Logo from '../ui/Logo';
import { IconButton } from '../ui/Button';

const STORAGE_KEY = 'slothsync_sidebar_collapsed';
const NARROW_BELOW = 1000;

const Sidebar = () => {
  const { pathname } = useLocation();
  const [manual, setManual] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? undefined : stored === '1';
    } catch {
      return undefined;
    }
  });
  const [narrow, setNarrow] = useState(() => window.innerWidth < NARROW_BELOW);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < NARROW_BELOW);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const collapsed = manual === undefined ? narrow : manual;

  const toggleCollapsed = useCallback(() => {
    setManual((current) => {
      const isCollapsed = current === undefined ? window.innerWidth < NARROW_BELOW : current;
      const next = !isCollapsed;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return (
    <aside
      className={cx('sidebar flex h-screen flex-col border-r border-line bg-surface', collapsed && 'is-collapsed')}
      aria-label="Primary navigation"
    >
      <div className="sidebar-brand flex items-center gap-3 border-b border-line px-4 py-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-ctl"
          aria-label="SlothSync AI dashboard"
          title={collapsed ? 'SlothSync AI' : undefined}
        >
          <Logo showText={!collapsed} size={32} />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className={cx('nav-item', active && 'is-active')}
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  <span className="sidebar-hide truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line px-3 py-3">
        {!collapsed ? (
          <div className="mb-3 flex items-start gap-2 rounded-ctl-sm border border-line bg-surface-2 px-2.5 py-2">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
            <span className="text-[11px] leading-snug text-ink-2">
              Local-first: scanning and file operations run on this device.
            </span>
          </div>
        ) : null}
        <div className="sidebar-footer-row flex items-center justify-between gap-2 px-1">
          <span className="mono sidebar-hide text-[11px] text-ink-3">v0.1.0</span>
          <IconButton
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            size="sm"
            onClick={toggleCollapsed}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
