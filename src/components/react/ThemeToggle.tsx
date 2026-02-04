import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  const applyTheme = (t: Theme) => {
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  };

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial: Theme = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    setTheme(initial);
    applyTheme(initial);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Re-apply when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const icon = theme === 'system' ? <Monitor className="h-4 w-4" />
             : theme === 'light' ? <Sun className="h-4 w-4" />
             : <Moon className="h-4 w-4" />;

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
      {icon}
    </Button>
  );
}
