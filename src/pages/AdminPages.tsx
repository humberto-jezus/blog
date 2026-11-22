import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { PageContent } from '../types';
import { motion } from 'motion/react';
import { Edit, FileText, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { fetchPages, deletePage } from '../utils/api';

import AdminSidebar from '../components/AdminSidebar';

export default function AdminPages() {
  const { user, isAdmin } = useAuth();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<PageContent | null>(null);
  const { t } = useI18n();

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const pagesData = await fetchPages();
      // Keep system pages (home, about) first, followed by custom pages
      const sorted = [...pagesData].sort((a, b) => {
        const aSys = a.id === 'home' ? 0 : a.id === 'about' ? 1 : 2;
        const bSys = b.id === 'home' ? 0 : b.id === 'about' ? 1 : 2;
        if (aSys !== bSys) return aSys - bSys;
        return a.title.localeCompare(b.title);
      });
      setPages(sorted);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPages();
    }
  }, [isAdmin, loadPages]);

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      setPageToDelete(null);
      window.dispatchEvent(new Event('pages-updated'));
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  const getPublicUrl = (page: PageContent) => {
    if (page.id === 'home') return '/';
    if (page.id === 'about') return '/about';
    return `/p/${page.id}`;
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#faf9f8] min-h-screen font-sans">
      <AdminSidebar />

      <main className="flex-1 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">{t('admin.managePages')}</h1>
            <Link
              to="/admin/pages/new"
              className="rounded-lg bg-[#0067b8] px-6 py-3 text-sm sm:text-base font-bold text-white hover:bg-[#005a9e] transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Nova Página
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-base font-semibold text-[#505050]">
                {t('admin.loadingPages')}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pages.map((page, index) => {
                  const isSystem = page.id === 'home' || page.id === 'about';
                  const publicUrl = getPublicUrl(page);

                  return (
                    <motion.li
                      key={page.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center text-[#0067b8] shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-[#1a1a1a] truncate">{page.title}</h3>
                            {isSystem && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-[#505050]">
                                Padrão
                              </span>
                            )}
                            {!isSystem && page.showInNav && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0067b8]">
                                No menu superior
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#505050]">Rota: {publicUrl}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={publicUrl}
                          title="Visualizar página"
                          className="p-2.5 rounded-lg text-[#505050] hover:text-[#0067b8] hover:bg-blue-50 transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/admin/pages/edit/${page.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#242424] hover:bg-gray-100 hover:border-[#0067b8] transition-colors border border-gray-300 shadow-xs"
                        >
                          <Edit className="h-4 w-4" />
                          {t('admin.edit')}
                        </Link>
                        {!isSystem && (
                          <button
                            type="button"
                            onClick={() => setPageToDelete(page)}
                            title="Excluir página"
                            className="p-2.5 rounded-lg text-[#505050] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>

      {pageToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Excluir página?</h3>
            <p className="text-sm font-medium text-[#505050] mb-6">
              Tem certeza que deseja excluir a página <strong>{pageToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPageToDelete(null)}
                className="px-5 py-2.5 text-sm font-bold text-[#404040] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pageToDelete.id)}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
