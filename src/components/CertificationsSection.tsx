import React, { useState, useMemo } from 'react';
import { Award, Search } from 'lucide-react';
import { CertificationBadge } from './CertificationBadge';
import { CERTIFICATIONS_LIST, CertificationItem } from '../utils/certificationsData';
import { useI18n } from '../contexts/I18nContext';

interface CertificationsSectionProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  limit?: number;
  className?: string;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  title,
  subtitle,
  showFilters = true,
  limit,
  className = '',
}) => {
  const { language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    return [
      { id: 'all', label: language === 'en' ? `All (${CERTIFICATIONS_LIST.length})` : `Todas (${CERTIFICATIONS_LIST.length})` },
      { id: 'role-based', label: 'Role-Based (AZ / AI)' },
      { id: 'trainer-skills', label: 'MCT & Applied Skills' },
      { id: 'finops', label: 'FinOps' },
      { id: 'fundamentals', label: language === 'en' ? 'Fundamentals (AZ / MS / SC / AI)' : 'Fundamentos (AZ / MS / SC / AI)' },
    ];
  }, [language]);

  const filteredCerts = useMemo(() => {
    return CERTIFICATIONS_LIST.filter((cert) => {
      const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
      const certName = cert.name[language] || cert.name.pt;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        certName.toLowerCase().includes(query) ||
        cert.code.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, language]);

  const displayedCerts = limit ? filteredCerts.slice(0, limit) : filteredCerts;

  const defaultTitle =
    language === 'en'
      ? 'Official Certifications & Credentials'
      : 'Certificações & Credenciais Oficiais';

  const defaultSubtitle =
    language === 'en'
      ? `${CERTIFICATIONS_LIST.length} validated credentials in Microsoft Azure Architecture, MCT, FinOps, and Cloud Security.`
      : `${CERTIFICATIONS_LIST.length} credenciais oficiais validadas em Microsoft Azure, MCT, FinOps e Segurança.`;

  return (
    <section className={`py-16 ${className}`} id="certifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0067b8] text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-4 h-4" />
            <span>{language === 'en' ? 'Validated Credentials' : 'Credenciais Validadas'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
            {title || defaultTitle}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#505050] leading-relaxed">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Filters and Search Bar */}
        {showFilters && (
          <div className="mb-10 space-y-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0067b8] text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-[#404040] border border-gray-200 hover:border-blue-300 hover:text-[#0067b8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search by code or title (e.g. AZ-305, SC-900, AI-102)...'
                    : 'Pesquisar por código ou título (ex: AZ-305, SC-900, AI-102)...'
                }
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] transition-all"
              />
            </div>
          </div>
        )}

        {/* Certifications Grid: Direct, Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCerts.map((cert) => {
            const rawName = cert.name[language] || cert.name.pt;
            // Direct title with the code integrated into the text
            const fullTitle = rawName.toLowerCase().includes(cert.code.toLowerCase())
              ? rawName
              : `${cert.code} – ${rawName}`;

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all hover:border-blue-300 flex items-center gap-4 group"
              >
                {/* Official Badge Image */}
                <div className="shrink-0">
                  <CertificationBadge
                    code={cert.code}
                    badgeLevel={cert.badgeLevel}
                    issuer={cert.issuer}
                    badgeImage={cert.badgeImage}
                    className="w-20 h-20"
                  />
                </div>

                {/* Direct Title with Code and Full Text Wrap */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#1a1a1a] leading-snug break-words group-hover:text-[#0067b8] transition-colors">
                    {fullTitle}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {displayedCerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-600">
              {language === 'en'
                ? 'No certification found with these criteria.'
                : 'Nenhuma certificação encontrada com esses critérios.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
