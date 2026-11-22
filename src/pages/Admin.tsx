import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { fetchPosts, deletePost } from '../utils/api';
import { useSeo } from '../hooks/useSeo';

import AdminSidebar from '../components/AdminSidebar';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useSeo({
    title: 'Painel Administrativo | Humberto Jezus',
    description: 'Gerenciamento de artigos e páginas do blog Humberto Jezus.',
    noindex: true,
  });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Não foi possível carregar os artigos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPosts();
    }
  }, [isAdmin, loadPosts]);

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#faf9f8] min-h-screen font-sans">
      <AdminSidebar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]"
            >
              {t('admin.dashboard')}
            </motion.h1>

            <Link
              to="/admin/new"
              className="rounded-lg bg-[#0067b8] px-6 py-3 text-sm sm:text-base font-bold text-white hover:bg-[#005a9e] transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              {t('admin.newArticle')}
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-base font-semibold text-[#505050]">
                {t('admin.loadingArticles')}
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-base font-medium text-[#505050] mb-4">{t('admin.noArticles')}</p>
                <Link
                  to="/admin/new"
                  className="text-[#0067b8] hover:text-[#005a9e] text-base font-bold hover:underline"
                >
                  {t('admin.createFirst')}
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-16 h-12 rounded-lg object-cover border border-gray-200 shrink-0 hidden sm:block"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-1 truncate">
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#505050]">
                          <span className="font-bold uppercase tracking-wider text-[#0067b8]">
                            {post.category}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold">{post.date}</span>
                          <span>&bull;</span>
                          <span className="font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-[#242424]">
                            {post.language}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/post/${post.id}`}
                        title="Ver artigo"
                        className="p-2.5 text-[#505050] hover:text-[#0067b8] transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/admin/edit/${post.id}`}
                        title={t('admin.edit')}
                        className="p-2.5 text-[#505050] hover:text-[#0067b8] transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <Edit2 className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => setPostToDelete(post.id)}
                        title={t('admin.delete')}
                        className="p-2.5 text-[#505050] hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">{t('admin.deleteConfirm')}</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-5 py-2.5 text-sm font-bold text-[#404040] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {t('adminEditor.cancel')}
              </button>
              <button
                onClick={() => handleDelete(postToDelete)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {t('admin.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
