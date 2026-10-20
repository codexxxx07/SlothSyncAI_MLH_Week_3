import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, Layers, Copy, History, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/scan', label: 'Scan Folders', icon: FolderOpen },
  { path: '/plan', label: 'Organization Plan', icon: Layers },
  { path: '/duplicates', label: 'Duplicates', icon: Copy },
  { path: '/history', label: 'Activity History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-soft-ivory dark:bg-dark-surface border-r border-neutral-border h-screen flex flex-col">
      <div className="p-6 border-b border-neutral-border">
        <h1 className="text-xl font-bold text-deep-charcoal dark:text-off-white">
          SlothSync AI
        </h1>
        <p className="text-sm text-muted-violet mt-1">
          You Relax. SlothSync Handles the Mess.
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-clay-sm transition-all ${
                      isActive
                        ? 'bg-muted-violet text-white shadow-clay'
                        : 'text-deep-charcoal dark:text-off-white hover:bg-muted-violet/10'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-border">
        <div className="text-xs text-muted-violet">
          SlothSync AI v0.1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
