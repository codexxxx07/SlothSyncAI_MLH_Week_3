import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-soft-ivory dark:bg-dark-surface border-b border-neutral-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-violet">
          Local-first • Privacy-focused
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-clay-sm bg-muted-violet/10 hover:bg-muted-violet/20 transition-all"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} className="text-muted-violet" /> : <Moon size={20} className="text-muted-violet" />}
      </button>
    </header>
  );
};

export default Header;
