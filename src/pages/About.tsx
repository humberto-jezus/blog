import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';
import NetworkBackground from '../components/NetworkBackground';
import ArticleContent from '../components/ArticleContent';
import PageSectionsRenderer from '../components/PageSectionsRenderer';
import { useI18n } from '../contexts/I18nContext';
import { PageContent } from '../types';
import { fetchPageById } from '../utils/api';
import { useSeo } from '../hooks/useSeo';
import {
  DEFAULT_ABOUT_CONTENT,
  mergeAboutConfig,
  PAGE_ICON_MAP,
} from '../utils/pageDefaults';

export default function About() {
  const { t, language } = useI18n();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [customAbout, setCustomAbout] = useState<PageContent | null>(null);

  useEffect(() => {
    let active = true;
    fetchPageById('about')
      .then((data) => {
        if (active && data) setCustomAbout(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const hasCustomConfig = Boolean(customAbout?.aboutConfig);
  const aboutConfig = mergeAboutConfig(customAbout?.aboutConfig);

  const heroTitle =
    customAbout?.title?.trim() || (language === 'en' ? t('about.title') : 'Sobre Mim');
  const heroSubtitle =
    customAbout?.subtitle !== undefined && customAbout.subtitle.trim()
      ? customAbout.subtitle
      : t('about.subtitle');

  useSeo({
    title: `${heroTitle} | Humberto Jezus – Enterprise Cloud Architect & MCT`,
    description: heroSubtitle,
  });
  const mainBodyContent = customAbout?.content?.trim()
    ? customAbout.content
    : DEFAULT_ABOUT_CONTENT;

  return (
    <div className="bg-[#faf9f8] min-h-screen font-sans pb-28">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-28 sm:py-32 px-4 text-center bg-[#010510]">
        <NetworkBackground />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg tracking-tight"
          >
            {heroTitle}
          </motion.h1>
          {heroSubtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-lg md:text-2xl font-medium text-white/95 drop-shadow-md leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="mx-auto max-w-3xl bg-white rounded-xl border border-gray-200 p-8 sm:p-12 shadow-sm">
          <ArticleContent content={mainBodyContent} />
        </div>
      </div>

      {/* Specialties */}
      {aboutConfig.showSpecialties && aboutConfig.specialties.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
              {hasCustomConfig ? aboutConfig.specialtiesTitle : t('about.specialties')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutConfig.specialties.map((spec, index) => {
              const Icon = PAGE_ICON_MAP[spec.icon] || PAGE_ICON_MAP.shield;
              return (
                <motion.div
                  key={`${spec.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <Icon className="h-6 w-6 text-[#0067b8]" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{spec.title}</h3>
                  <p className="text-base font-medium text-[#4a4a4a] leading-relaxed">
                    {spec.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certifications */}
      {aboutConfig.showCertifications && aboutConfig.certifications.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
              {hasCustomConfig ? aboutConfig.certificationsTitle : t('about.certs')}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {aboutConfig.certifications.map((cert, i) => {
              const errKey = `${cert.name}-${i}`;
              return (
                <motion.div
                  key={errKey}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  {cert.imageUrl && !failedImages[errKey] ? (
                    <img
                      src={cert.imageUrl}
                      alt={cert.name}
                      onError={() => handleImageError(errKey)}
                      className="w-24 h-24 object-contain drop-shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="relative w-24 h-24 flex flex-col items-center justify-center rounded-full bg-blue-50/50 border border-blue-100">
                      <Award className="h-10 w-10 text-[#0067b8]" />
                      <span className="absolute bottom-1 text-xs font-bold text-[#0067b8] tracking-wider">
                        CERT
                      </span>
                    </div>
                  )}
                  <span className="font-bold text-[#1a1a1a] text-base leading-tight">
                    {cert.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community */}
      {aboutConfig.showCommunity && aboutConfig.community.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
              {hasCustomConfig ? aboutConfig.communityTitle : t('about.community')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aboutConfig.community.map((block, idx) => {
              const Icon = PAGE_ICON_MAP[block.icon] || PAGE_ICON_MAP.rocket;
              return (
                <motion.div
                  key={`${block.title}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <Icon className="h-6 w-6 text-[#0067b8]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1a1a1a]">{block.title}</h3>
                  </div>
                  {block.description && (
                    <p className="text-base font-medium text-[#4a4a4a] mb-6 leading-relaxed">
                      {block.description}
                    </p>
                  )}
                  {block.highlights && block.highlights.length > 0 && (
                    <ul className="space-y-3">
                      {block.highlights.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-base font-semibold text-[#242424]"
                        >
                          <div className="h-2 w-2 rounded-full bg-[#0067b8] shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {customAbout?.sections && customAbout.sections.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <PageSectionsRenderer sections={customAbout.sections} />
        </div>
      )}
    </div>
  );
}
