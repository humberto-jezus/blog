import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { BlogPost } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { fetchPosts } from '../utils/api';
import { useSeo } from '../hooks/useSeo';

function selectPostsForLanguage(allPosts: BlogPost[], language: 'pt' | 'en'): BlogPost[] {
  const preferredKeys = new Set(
    allPosts
      .filter((p) => p.language === language)
      .map((p) => `${p.date}::${p.imageUrl}`)
  );

  return allPosts.filter(
    (p) => p.language === language || !preferredKeys.has(`${p.date}::${p.imageUrl}`)
  );
}

export default function Articles() {
  const { t, language } = useI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useSeo({
    title:
      language === 'en'
        ? 'Microsoft Azure & Cloud Articles | Humberto Jezus'
        : 'Artigos de Microsoft Azure & Cloud | Humberto Jezus',
    description:
      language === 'en'
        ? 'Browse technical tutorials, PowerShell and Terraform scripts, Azure Bicep guides, cloud security, and FinOps best practices.'
        : 'Explore tutoriais práticos, scripts PowerShell, Terraform, Azure Bicep, segurança IAM e FinOps no blog de Humberto Jezus.',
  });

  useEffect(() => {
    let active = true;

    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await fetchPosts();
        if (!active) return;
        setPosts(selectPostsForLanguage(allPosts, language));
        setSelectedCategory('All');
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      active = false;
    };
  }, [language]);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#faf9f8] min-h-screen py-16 sm:py-24 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight"
          >
            {t('articles.title')}
          </motion.h1>
        </div>

        <div className="mx-auto max-w-2xl mb-16">
          <div className="relative mb-8">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-[#505050]" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-lg bg-white border border-gray-300 py-3.5 pl-12 pr-4 text-base font-medium text-[#1a1a1a] shadow-sm focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
              placeholder={t('articles.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-5 py-2.5 text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#0067b8] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-[#242424] hover:bg-gray-100'
                }`}
              >
                {category === 'All' ? t('articles.allCategories') : category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-lg font-semibold text-[#505050]">{t('articles.loading')}</div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-24 text-center">
            <p className="text-xl font-semibold text-[#505050]">{t('articles.empty')}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 rounded-lg bg-blue-50 px-6 py-3 text-[#0067b8] hover:bg-blue-100 text-base font-bold transition-colors cursor-pointer"
            >
              {t('articles.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
