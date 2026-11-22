import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { ChevronLeft, Bookmark, Linkedin, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../contexts/I18nContext';
import { MOCK_POSTS } from '../utils/mockData';
import { fetchPostById } from '../utils/api';
import ArticleContent from '../components/ArticleContent';
import { useSeo } from '../hooks/useSeo';

interface TranslatedFields {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
}

const getCacheKey = (post: BlogPost, targetLang: 'pt' | 'en') =>
  `post_translation_v1_${post.id}_${targetLang}_${post.title.length}_${post.content.length}`;

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useI18n();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const [translated, setTranslated] = useState<TranslatedFields | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (!id) return false;
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_posts') || '[]');
      return Array.isArray(saved) && saved.includes(id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let active = true;

    const loadPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fetchedPost = await fetchPostById(id);
        if (!active) return;
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();
    return () => {
      active = false;
    };
  }, [id]);

  // Automatically translate article when active UI language differs from post's original language
  useEffect(() => {
    if (!post) return;

    const postLang = post.language || 'pt';
    if (postLang === language) {
      setTranslated(null);
      setIsTranslating(false);
      setTranslationError(null);
      return;
    }

    // 1. Check if there is a paired translated post in MOCK_POSTS (instant 0ms translation)
    const pairedMock = MOCK_POSTS.find(
      (p) =>
        p.language === language &&
        p.imageUrl === post.imageUrl &&
        p.date === post.date &&
        p.id !== post.id
    );
    if (pairedMock) {
      setTranslated({
        title: pairedMock.title,
        excerpt: pairedMock.excerpt,
        content: pairedMock.content,
        category: pairedMock.category,
        readTime: pairedMock.readTime,
        date: pairedMock.date,
      });
      setIsTranslating(false);
      setTranslationError(null);
      return;
    }

    // 2. Check sessionStorage cache for already translated article
    const cacheKey = getCacheKey(post, language);
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as TranslatedFields;
        if (parsed.title && parsed.content) {
          setTranslated(parsed);
          setIsTranslating(false);
          setTranslationError(null);
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    // 3. Call server-side Gemini translation endpoint
    const controller = new AbortController();
    let active = true;

    const translateArticle = async () => {
      setIsTranslating(true);
      setTranslationError(null);

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            readTime: post.readTime,
            date: post.date,
            targetLanguage: language,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || 'Translation request failed');
        }

        const data = (await res.json()) as TranslatedFields;
        if (!active) return;

        setTranslated(data);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {
          // Ignore quota errors
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || !active) return;
        console.error('Auto-translation error:', err);
        setTranslationError(t('postDetail.translationError'));
      } finally {
        if (active) {
          setIsTranslating(false);
        }
      }
    };

    translateArticle();

    return () => {
      active = false;
      controller.abort();
    };
  }, [post, language, retryCount, t]);

  const handleToggleBookmark = useCallback(() => {
    if (!id) return;
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        const saved: string[] = JSON.parse(localStorage.getItem('bookmarked_posts') || '[]');
        const updated = next
          ? Array.from(new Set([...saved, id]))
          : saved.filter((item) => item !== id);
        localStorage.setItem('bookmarked_posts', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [id]);

  const seoTitle = post
    ? `${translated?.title ?? post.title} | Humberto Jezus`
    : 'Humberto Jezus – Artigo de Microsoft Azure';
  const seoDescription = post
    ? translated?.excerpt ?? post.excerpt
    : 'Artigo técnico sobre Microsoft Azure por Humberto Jezus.';
  const seoImage =
    post?.imageUrl && /^https?:\/\//i.test(post.imageUrl)
      ? post.imageUrl
      : post?.imageUrl?.startsWith('data:image/')
        ? `${window.location.origin}/api/posts/${encodeURIComponent(post.id)}/og-image`
        : undefined;

  useSeo({
    title: seoTitle,
    description: seoDescription,
    type: post ? 'article' : 'website',
    image: seoImage,
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: translated?.title ?? post.title,
          description: seoDescription,
          ...(seoImage ? { image: [seoImage] } : {}),
          datePublished: String(post.createdAt || post.date),
          dateModified: String(post.updatedAt || post.createdAt || post.date),
          articleSection: translated?.category ?? post.category,
          inLanguage: language === 'en' ? 'en-US' : 'pt-BR',
          author: {
            '@type': 'Person',
            name: post.author || 'Humberto Jezus',
          },
          publisher: {
            '@type': 'Person',
            name: 'Humberto Jezus',
          },
        }
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8]">
        <div className="text-lg font-semibold text-[#505050]">{t('postDetail.loading')}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f8] px-4">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4">{t('postDetail.notFound')}</h1>
        <p className="text-lg font-medium text-[#505050] mb-8 text-center max-w-md">
          {t('postDetail.notFoundDesc')}
        </p>
        <Link
          to="/articles"
          className="rounded-lg bg-[#0067b8] px-7 py-3 text-base font-bold text-white hover:bg-[#005a9e] transition-colors"
        >
          {t('postDetail.backArticles')}
        </Link>
      </div>
    );
  }

  const displayedTitle = translated?.title ?? post.title;
  const displayedCategory = translated?.category ?? post.category;
  const displayedDate = translated?.date ?? post.date;
  const displayedReadTime = translated?.readTime ?? post.readTime;
  const displayedContent = translated?.content ?? post.content;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#faf9f8] min-h-screen pb-24 font-sans"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-[#0067b8] hover:bg-blue-50 px-3 py-2 -ml-3 rounded-lg transition-colors mb-8 text-base font-bold"
        >
          <ChevronLeft className="h-5 w-5" />
          {t('postDetail.articles')}
        </Link>

        {isTranslating && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm sm:text-base font-semibold text-[#0067b8]">
            <Loader2 className="h-5 w-5 animate-spin shrink-0" />
            <span>{t('postDetail.translating')}</span>
          </div>
        )}

        {translationError && !isTranslating && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm sm:text-base font-semibold text-amber-900">
            <span>{translationError}</span>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-900 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-amber-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              {t('postDetail.retryTranslation')}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <span className="text-sm font-bold uppercase tracking-wider text-[#0067b8]">
            {displayedCategory}
          </span>
          <span className="text-sm text-gray-400">&bull;</span>
          <time dateTime={post.date} className="text-sm font-bold text-[#505050]">
            {displayedDate}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-8 leading-tight tracking-tight">
          {displayedTitle}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-8 mb-10">
          <div className="flex items-center gap-3.5">
            {post.authorPhotoUrl ? (
              <img
                src={post.authorPhotoUrl}
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#0067b8] font-bold text-lg">
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1a1a1a]">{post.author}</span>
              <span className="text-sm font-semibold text-[#505050]">{displayedReadTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-bold text-[#242424] hover:text-[#0067b8] hover:border-[#0067b8] transition-colors shadow-xs"
              title={t('postDetail.shareLinkedIn')}
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold transition-colors shadow-xs cursor-pointer ${
                isBookmarked
                  ? 'border-[#0067b8] bg-blue-50 text-[#0067b8]'
                  : 'border-gray-200 bg-white text-[#242424] hover:text-[#0067b8] hover:border-[#0067b8]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? t('postDetail.saved') : t('postDetail.save')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src={post.imageUrl}
            alt={displayedTitle}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-opacity duration-200 ${
            isTranslating ? 'opacity-60' : 'opacity-100'
          }`}
        >
          <ArticleContent content={displayedContent} />
        </div>
      </div>
    </motion.article>
  );
}
