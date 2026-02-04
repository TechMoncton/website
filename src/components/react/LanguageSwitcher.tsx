import { Button } from '@/components/ui/button';
import { languages, type Language, setLanguagePreference } from '@/i18n';

interface LanguageSwitcherProps {
  currentLang: Language;
  currentPath: string;
}

export function LanguageSwitcher({ currentLang, currentPath }: LanguageSwitcherProps) {
  const otherLang = currentLang === 'en' ? 'fr' : 'en';

  // Build the path for the other language
  const getOtherLangPath = () => {
    // Remove current lang from path
    let path = currentPath;
    if (path.startsWith(`/${currentLang}`)) {
      path = path.slice(currentLang.length + 1);
    }
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    // Build new path
    return `/${otherLang}${path === '/' ? '' : path}`;
  };

  const handleClick = () => {
    setLanguagePreference(otherLang);
    window.location.href = getOtherLangPath();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      {languages[otherLang]}
    </Button>
  );
}
