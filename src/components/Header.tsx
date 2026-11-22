import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { PageContent } from '../types';
import { fetchPages } from '../utils/api';

function BrazilFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      className={`${className} rounded-[2px] shadow-xs shrink-0`}
      aria-hidden="true"
    >
      <rect width="28" height="20" fill="#009c3b" />
      <polygon points="14,2.5 25,10 14,17.5 3,10" fill="#ffdf00" />
      <circle cx="14" cy="10" r="4.3" fill="#002776" />
      <path
        d="M10.1 9.1c2.5-0.9 5.5-0.4 7.7 1.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function USFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      className={`${className} rounded-[2px] shadow-xs shrink-0`}
      aria-hidden="true"
    >
      <rect width="28" height="20" fill="#ffffff" />
      <rect y="0" width="28" height="1.54" fill="#b22234" />
      <rect y="3.08" width="28" height="1.54" fill="#b22234" />
      <rect y="6.15" width="28" height="1.54" fill="#b22234" />
      <rect y="9.23" width="28" height="1.54" fill="#b22234" />
      <rect y="12.31" width="28" height="1.54" fill="#b22234" />
      <rect y="15.38" width="28" height="1.54" fill="#b22234" />
      <rect y="18.46" width="28" height="1.54" fill="#b22234" />
      <rect width="12" height="10.77" fill="#3c3b6e" />
      <g fill="#ffffff">
        <circle cx="2.2" cy="2.1" r="0.65" />
        <circle cx="4.8" cy="2.1" r="0.65" />
        <circle cx="7.4" cy="2.1" r="0.65" />
        <circle cx="10" cy="2.1" r="0.65" />
        <circle cx="3.5" cy="4.1" r="0.65" />
        <circle cx="6.1" cy="4.1" r="0.65" />
        <circle cx="8.7" cy="4.1" r="0.65" />
        <circle cx="2.2" cy="6.1" r="0.65" />
        <circle cx="4.8" cy="6.1" r="0.65" />
        <circle cx="7.4" cy="6.1" r="0.65" />
        <circle cx="10" cy="6.1" r="0.65" />
        <circle cx="3.5" cy="8.1" r="0.65" />
        <circle cx="6.1" cy="8.1" r="0.65" />
        <circle cx="8.7" cy="8.1" r="0.65" />
      </g>
    </svg>
  );
}

export default function Header() {
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navPages, setNavPages] = useState<PageContent[]>([]);

  useEffect(() => {
    const loadNavPages = async () => {
      try {
        const all = await fetchPages();
        setNavPages(all.filter((p) => !p.isSystem && p.id !== 'home' && p.id !== 'about' && p.showInNav));
      } catch {
        // Ignore nav page errors
      }
    };

    loadNavPages();
    window.addEventListener('pages-updated', loadNavPages);
    return () => window.removeEventListener('pages-updated', loadNavPages);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#1a1a1a] transition-opacity hover:opacity-80 shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Humberto Jezus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/'
                  ? 'text-[#0067b8] bg-blue-50'
                  : 'text-[#242424] hover:text-[#0067b8] hover:bg-gray-100'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/articles"
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/articles' || location.pathname.startsWith('/post/')
                  ? 'text-[#0067b8] bg-blue-50'
                  : 'text-[#242424] hover:text-[#0067b8] hover:bg-gray-100'
              }`}
            >
              {t('nav.articles')}
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                location.pathname === '/about'
                  ? 'text-[#0067b8] bg-blue-50'
                  : 'text-[#242424] hover:text-[#0067b8] hover:bg-gray-100'
              }`}
            >
              {t('nav.about')}
            </Link>
            {navPages.map((page) => (
              <Link
                key={page.id}
                to={`/p/${page.id}`}
                className={`px-4 py-2.5 rounded-lg text-base font-bold transition-colors ${
                  location.pathname === `/p/${page.id}`
                    ? 'text-[#0067b8] bg-blue-50'
                    : 'text-[#242424] hover:text-[#0067b8] hover:bg-gray-100'
                }`}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center rounded-lg bg-gray-100 p-1 border border-gray-200"
            role="group"
            aria-label="Selecionar idioma / Select language"
          >
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              aria-pressed={language === 'pt'}
              title="Português (Brasil)"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all cursor-pointer ${
                language === 'pt'
                  ? 'bg-white text-[#0067b8] shadow-sm ring-1 ring-gray-200'
                  : 'text-[#404040] hover:text-[#1a1a1a]'
              }`}
            >
              <BrazilFlag className="w-5 h-3.5" />
              <span>PT</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              title="English (US)"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#0067b8] shadow-sm ring-1 ring-gray-200'
                  : 'text-[#404040] hover:text-[#1a1a1a]'
              }`}
            >
              <USFlag className="w-5 h-3.5" />
              <span>EN</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg text-[#242424] hover:text-[#0067b8] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1.5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 px-4 rounded-lg text-base font-bold ${
              location.pathname === '/' ? 'text-[#0067b8] bg-blue-50' : 'text-[#242424] hover:bg-gray-100'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/articles"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 px-4 rounded-lg text-base font-bold ${
              location.pathname === '/articles' || location.pathname.startsWith('/post/')
                ? 'text-[#0067b8] bg-blue-50'
                : 'text-[#242424] hover:bg-gray-100'
            }`}
          >
            {t('nav.articles')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-3 px-4 rounded-lg text-base font-bold ${
              location.pathname === '/about' ? 'text-[#0067b8] bg-blue-50' : 'text-[#242424] hover:bg-gray-100'
            }`}
          >
            {t('nav.about')}
          </Link>
          {navPages.map((page) => (
            <Link
              key={page.id}
              to={`/p/${page.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-4 rounded-lg text-base font-bold ${
                location.pathname === `/p/${page.id}`
                  ? 'text-[#0067b8] bg-blue-50'
                  : 'text-[#242424] hover:bg-gray-100'
              }`}
            >
              {page.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
