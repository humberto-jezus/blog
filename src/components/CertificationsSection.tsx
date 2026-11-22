import React, { useState, useMemo } from 'react';
import { Award, Check, Copy, ExternalLink, Search, ShieldCheck } from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      { id: 'all', label: language === 'en' ? `All (${CERTIFICATIONS_LIST.length})` : `Todas (${CERTIFICATIONS_LIST.length})` },
      { id: 'role-based', label: language === 'en' ? 'Microsoft Role-Based' : 'Microsoft Especialista' },
      { id: 'trainer-skills', label: 'MCT & Applied Skills' },
      { id: 'finops-architecture', label: language === 'en' ? 'Architecture, FinOps & AWS' : 'Arquitetura, FinOps & AWS' },
      { id: 'block64', label: 'Block 64 (Migration)' },
      { id: 'fundamentals', label: language === 'en' ? 'Fundamentals' : 'Fundamentos' },
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
        (cert.credentialId && cert.credentialId.toLowerCase().includes(query)) ||
        cert.issuer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, language]);

  const displayedCerts = limit ? filteredCerts.slice(0, limit) : filteredCerts;

  const handleCopy = (credentialId: string, id: string) => {
    navigator.clipboard.writeText(credentialId);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const defaultTitle =
    language === 'en'
      ? 'Official Certifications & Credentials'
      : 'Certificações & Credenciais Oficiais';

  const defaultSubtitle =
    language === 'en'
      ? `${CERTIFICATIONS_LIST.length} validated professional credentials spanning Microsoft Azure Architect Expert, MCT, FinOps, Security, and Cloud Architecture.`
      : `${CERTIFICATIONS_LIST.length} credenciais profissionais validadas abrangendo Microsoft Azure Architect Expert, MCT, FinOps, Segurança e Arquitetura de Nuvem.`;

  return (
    <section className={`py-16 ${className}`} id="certifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0067b8] text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-4 h-4" />
            <span>{language === 'en' ? 'Validated Expertise' : 'Expertise Validada'}</span>
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
                    ? 'Search by code, title, or credential ID...'
                    : 'Pesquisar por código, título ou ID da credencial...'
                }
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0067b8]/20 focus:border-[#0067b8] transition-all"
              />
            </div>
          </div>
        )}

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCerts.map((cert) => {
            const certName = cert.name[language] || cert.name.pt;
            const isCopied = copiedId === cert.id;

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all hover:border-blue-200 flex flex-col justify-between group"
              >
                <div className="flex items-start gap-4">
                  {/* Badge Vector */}
                  <div className="shrink-0">
                    <CertificationBadge
                      code={cert.code}
                      badgeLevel={cert.badgeLevel}
                      issuer={cert.issuer}
                      badgeSvg={cert.badgeSvg}
                      className="w-20 h-20"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-[#404040]">
                        <ShieldCheck className="w-3 h-3 text-[#0067b8]" />
                        {cert.issuer}
                      </span>
                      {cert.featured && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {language === 'en' ? 'TOP' : 'DESTAQUE'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#0067b8] transition-colors">
                      {certName}
                    </h3>
                  </div>
                </div>

                {/* Bottom Actions: Credential ID & Verify */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                  {cert.credentialId ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-gray-400 font-medium shrink-0">ID:</span>
                      <code className="font-mono text-[11px] font-semibold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[120px] sm:max-w-[140px]">
                        {cert.credentialId}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(cert.credentialId!, cert.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-[#0067b8] hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                        title={language === 'en' ? 'Copy Credential ID' : 'Copiar ID da Credencial'}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium">
                      {language === 'en' ? 'Official Trainer / Cert' : 'Credencial Oficial'}
                    </span>
                  )}

                  {cert.verifyUrl && (
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0067b8] hover:text-[#004e8c] hover:underline shrink-0"
                    >
                      <span>{language === 'en' ? 'Verify' : 'Validar'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
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
