import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { PageContent } from '../types';
import { fetchPageById } from '../utils/api';
import NetworkBackground from '../components/NetworkBackground';
import ArticleContent from '../components/ArticleContent';
import PageSectionsRenderer from '../components/PageSectionsRenderer';
import { useSeo } from '../hooks/useSeo';

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchPageById(slug);
        if (!active) return;
        setPage(data);
      } catch (err) {
        console.error('Error loading page:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  useSeo({
    title: page ? `${page.title} | Humberto Jezus` : 'Humberto Jezus – Microsoft Azure',
    description:
      page?.subtitle?.trim() ||
      'Conteúdo técnico e recursos sobre Microsoft Azure por Humberto Jezus, Enterprise Cloud Architect e MCT.',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8]">
        <div className="text-lg font-semibold text-[#505050]">Carregando página...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f8] px-4">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4">Página não encontrada</h1>
        <p className="text-lg font-medium text-[#505050] mb-8 text-center max-w-md">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-[#0067b8] px-7 py-3 text-base font-bold text-white hover:bg-[#005a9e] transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const hasMainContent = Boolean(page.content && page.content.replace(/<[^>]+>/g, '').trim());
  const hasSections = Boolean(page.sections && page.sections.length > 0);

  return (
    <div className="bg-[#faf9f8] min-h-screen font-sans pb-24">
      <div className="relative overflow-hidden py-24 sm:py-28 px-4 text-center bg-[#010510]">
        <NetworkBackground />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg tracking-tight"
          >
            {page.title}
          </motion.h1>
          {page.subtitle?.trim() && (
            <p className="mt-5 text-lg md:text-2xl font-medium text-white/95 drop-shadow-md leading-relaxed">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[#0067b8] hover:bg-blue-50 px-3 py-2 -ml-3 rounded-lg transition-colors mb-6 text-base font-bold"
          >
            <ChevronLeft className="h-5 w-5" />
            Início
          </Link>

          {(hasMainContent || !hasSections) && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm">
              <ArticleContent content={page.content} />
            </div>
          )}
        </div>

        {hasSections && <PageSectionsRenderer sections={page.sections} />}
      </div>
    </div>
  );
}
