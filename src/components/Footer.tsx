import { Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#f2f2f2] py-14 mt-auto relative z-10 font-sans border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 text-[#1a1a1a] mb-4">
              <span className="text-xl font-bold tracking-tight">Humberto Jezus</span>
            </Link>
            <p className="text-[#404040] text-sm sm:text-base font-medium max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#1a1a1a] mb-4 uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="inline-block py-1 text-base font-semibold text-[#404040] hover:text-[#0067b8] hover:underline transition-colors"
                >
                  {t('footer.overview')}
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="inline-block py-1 text-base font-semibold text-[#404040] hover:text-[#0067b8] hover:underline transition-colors"
                >
                  {t('nav.articles')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="inline-block py-1 text-base font-semibold text-[#404040] hover:text-[#0067b8] hover:underline transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#1a1a1a] mb-4 uppercase tracking-wider">
              {t('footer.connect')}
            </h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="inline-flex items-center justify-center p-2.5 rounded-lg bg-white border border-gray-200 text-[#404040] hover:text-[#0067b8] hover:border-[#0067b8] transition-colors shadow-xs"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/humbertojezus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2.5 rounded-lg bg-white border border-gray-200 text-[#404040] hover:text-[#0067b8] hover:border-[#0067b8] transition-colors shadow-xs"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-300/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-[#505050]">
            &copy; {new Date().getFullYear()} Humberto Jezus. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm font-semibold text-[#505050]">
            <a href="#" className="hover:text-[#0067b8] hover:underline transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="hover:text-[#0067b8] hover:underline transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
