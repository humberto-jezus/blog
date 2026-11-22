import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import ArticleContent from '../components/ArticleContent';
import PageSectionsRenderer from '../components/PageSectionsRenderer';
import { CertificationsSection } from '../components/CertificationsSection';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost, PageContent } from '../types';
import NetworkBackground from '../components/NetworkBackground';
import { useI18n } from '../contexts/I18nContext';
import { fetchPosts, fetchPageById } from '../utils/api';
import { mergeHomeConfig } from '../utils/pageDefaults';
import { useSeo } from '../hooks/useSeo';

function selectPostsForLanguage(allPosts: BlogPost[], language: 'pt' | 'en'): BlogPost[] {
  // Show all posts in the selected language, PLUS any single-language post from the other language
  // (deduplicating only paired demo posts that share the exact same date + imageUrl).
  const preferredKeys = new Set(
    allPosts
      .filter((p) => p.language === language)
      .map((p) => `${p.date}::${p.imageUrl}`)
  );

  return allPosts.filter(
    (p) => p.language === language || !preferredKeys.has(`${p.date}::${p.imageUrl}`)
  );
}

export default function Home() {
  const { t, language } = useI18n();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: `${pageContent?.title || 'Humberto Jezus'} – Blog de Microsoft Azure & Cloud`,
    description:
      language === 'en'
        ? 'Hands-on Microsoft Azure articles, cloud architecture patterns, IAM security, Terraform, Bicep, and FinOps by Humberto Jezus (MCT).'
        : 'Artigos práticos, arquiteturas reais, segurança, FinOps e automação em Microsoft Azure por Humberto Jezus, Enterprise Cloud Architect e MCT.',
  });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [allPosts, homePage] = await Promise.all([
          fetchPosts(),
          fetchPageById('home').catch(() => null),
        ]);
        if (!active) return;
        setFeaturedPosts(selectPostsForLanguage(allPosts, language));
        setPageContent(homePage);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [language]);

  const homeConfig = mergeHomeConfig(pageContent?.homeConfig);
  const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

  const renderHeroButton = (text: string, link: string, variant: 'primary' | 'secondary') => {
    if (!text.trim()) return null;
    const className =
      variant === 'primary'
        ? 'bg-[#0067b8] text-white px-9 py-4 rounded-lg text-base md:text-lg font-bold hover:bg-[#005a9e] transition-colors shadow-lg cursor-pointer'
        : 'border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white px-9 py-4 rounded-lg text-base md:text-lg font-bold hover:bg-white/20 transition-colors shadow-lg cursor-pointer';

    if (isExternalLink(link)) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
          {text}
        </a>
      );
    }

    return (
      <Link to={link || '/'} className={className}>
        {text}
      </Link>
    );
  };

  const heroTitle = language === 'en' ? t('home.welcome') : (pageContent?.title || t('home.welcome'));
  const heroSubtitle = language === 'en' ? t('home.subtitle') : (pageContent?.content?.trim() ? null : t('home.subtitle'));

  return (
    <div className="bg-[#faf9f8] min-h-screen font-sans">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden py-28 sm:py-32 px-4 text-center bg-[#010510]">
        <NetworkBackground />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
            {heroTitle}
          </h1>

          {language === 'en' || !pageContent?.content?.trim() ? (
            <p className="text-white/95 text-lg md:text-2xl font-medium mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              {t('home.subtitle')}
            </p>
          ) : (
            <div
              className="prose prose-invert max-w-2xl mx-auto mb-10 prose-p:text-white/95 prose-p:text-lg md:prose-p:text-2xl prose-p:font-medium drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {renderHeroButton(
              language === 'en'
                ? t('home.readArticles')
                : (pageContent?.homeConfig ? homeConfig.primaryButtonText : t('home.readArticles')),
              homeConfig.primaryButtonLink,
              'primary'
            )}
            {renderHeroButton(
              language === 'en'
                ? t('nav.about')
                : (pageContent?.homeConfig ? homeConfig.secondaryButtonText : t('nav.about')),
              homeConfig.secondaryButtonLink,
              'secondary'
            )}
          </div>
        </div>
      </div>

      {/* Official Certifications & Badges Section */}
      <CertificationsSection className="bg-[#f3f5f8] border-b border-gray-200" />

      {/* Optional Editable Extra Content Block */}
      {homeConfig.extraContent?.trim() && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <ArticleContent content={homeConfig.extraContent} />
          </div>
        </div>
      )}

      {/* Recent Posts Section */}
      {homeConfig.showLatestPosts && (
        <div className="py-20 bg-[#faf9f8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-sm font-bold text-[#0067b8] uppercase tracking-wider mb-2">
                  {language === 'en'
                    ? t('home.news')
                    : (pageContent?.homeConfig ? homeConfig.postsEyebrow : t('home.news'))}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                  {language === 'en'
                    ? t('home.latest')
                    : (pageContent?.homeConfig ? homeConfig.postsTitle : t('home.latest'))}
                </h3>
              </div>
              <Link
                to="/articles"
                className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-lg text-[#0067b8] hover:bg-blue-50 text-base font-bold transition-colors"
              >
                {language === 'en'
                  ? t('home.viewAll')
                  : (pageContent?.homeConfig ? homeConfig.postsViewAllText : t('home.viewAll'))}{' '}
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center text-lg font-semibold text-[#505050] py-12">
                {t('home.loading')}
              </div>
            ) : featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {featuredPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center text-lg font-semibold text-[#505050] py-12">
                {t('home.empty')}
              </div>
            )}

            <div className="mt-10 sm:hidden flex justify-center">
              <Link
                to="/articles"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-50 text-[#0067b8] hover:bg-blue-100 text-base font-bold transition-colors"
              >
                {t('home.viewAllArticles')} <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {pageContent?.sections && pageContent.sections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <PageSectionsRenderer sections={pageContent.sections} />
        </div>
      )}
    </div>
  );
}
