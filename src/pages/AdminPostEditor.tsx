import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Loader2, Upload, Eye, Edit3, X } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import ArticleContent from '../components/ArticleContent';
import { useI18n } from '../contexts/I18nContext';
import { fetchPostById, createPost, updatePost } from '../utils/api';

import AdminSidebar from '../components/AdminSidebar';

/**
 * Resize and compress a local image file in the browser so uploads are fast and lightweight.
 */
function resizeImageFile(file: File, maxWidth: number, maxHeight: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler a imagem selecionada.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem no navegador.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputMime, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPostEditor() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { t, language: currentLanguage } = useI18n();

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const authorFileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    imageUrl: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: currentLanguage === 'pt' ? '5 min de leitura' : '5 min read',
    author: user?.displayName || 'Humberto Jezus',
    authorPhotoUrl: user?.photoURL || '',
    language: currentLanguage as 'pt' | 'en',
  });

  useEffect(() => {
    if (isEditing && isAdmin && id) {
      const loadPost = async () => {
        try {
          const data = await fetchPostById(id);
          if (data) {
            setFormData({
              title: data.title,
              excerpt: data.excerpt,
              content: data.content,
              category: data.category,
              imageUrl: data.imageUrl,
              date: data.date,
              readTime: data.readTime,
              author: data.author || '',
              authorPhotoUrl: data.authorPhotoUrl || '',
              language: data.language || 'pt',
            });
          } else {
            setError(t('adminEditor.postNotFound'));
          }
        } catch (err) {
          console.error('Error fetching post:', err);
          setError(t('adminEditor.failedToLoad'));
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [id, isEditing, isAdmin, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImageFile(file, 1400, 900, 0.85);
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar imagem de capa.');
    } finally {
      e.target.value = '';
    }
  };

  const handleAuthorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImageFile(file, 320, 320, 0.88);
      setFormData((prev) => ({ ...prev, authorPhotoUrl: dataUrl }));
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar foto do autor.');
    } finally {
      e.target.value = '';
    }
  };

  const saveArticle = async () => {
    if (!user || !isAdmin) return;

    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setError('Preencha título, resumo e conteúdo do artigo antes de publicar.');
      setShowPreview(false);
      return;
    }

    if (!formData.imageUrl.trim()) {
      setError('Envie uma imagem de capa do computador ou informe uma URL válida.');
      setShowPreview(false);
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing && id) {
        await updatePost(id, formData);
      } else {
        await createPost(formData);
      }
      navigate('/admin');
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err?.message || t('adminEditor.failedToSave'));
      setShowPreview(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveArticle();
  };

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8] text-lg font-semibold text-[#505050]">
        {t('adminEditor.loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#faf9f8] min-h-screen font-sans">
      <AdminSidebar />

      <main className="flex-1 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-[#0067b8] hover:underline transition-colors text-base font-bold"
            >
              <ChevronLeft className="h-5 w-5" />
              {t('adminEditor.backToDashboard')}
            </Link>

            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors border shadow-xs cursor-pointer ${
                showPreview
                  ? 'bg-[#0067b8] text-white border-[#0067b8] hover:bg-[#005a9e]'
                  : 'bg-white text-[#242424] border-gray-300 hover:border-[#0067b8] hover:text-[#0067b8]'
              }`}
            >
              {showPreview ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  Voltar para Edição
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Pré-visualizar Artigo
                </>
              )}
            </button>
          </div>

          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50 border-b border-blue-100 px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0067b8]">
                  <Eye className="h-4 w-4" />
                  <span>Pré-visualização do Artigo (como os leitores vão ver)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-[#242424] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveArticle}
                    className="rounded-lg bg-[#0067b8] px-5 py-2 text-sm font-bold text-white hover:bg-[#005a9e] transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEditing ? t('adminEditor.updateArticle') : t('adminEditor.publishArticle')}
                  </button>
                </div>
              </div>

              <div className="p-8 sm:p-12 max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center gap-2.5 mb-5">
                  <span className="text-sm font-bold uppercase tracking-wider text-[#0067b8]">
                    {formData.category || 'Categoria'}
                  </span>
                  <span className="text-sm text-gray-400">&bull;</span>
                  <span className="text-sm font-bold text-[#505050]">{formData.date}</span>
                  <span className="text-sm text-gray-400">&bull;</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-[#242424]">
                    {formData.language}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6 leading-tight">
                  {formData.title || 'Título do artigo'}
                </h1>

                {formData.excerpt && (
                  <p className="text-lg font-medium text-[#505050] mb-8 leading-relaxed">
                    {formData.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-3.5 border-b border-gray-200 pb-8 mb-8">
                  {formData.authorPhotoUrl ? (
                    <img
                      src={formData.authorPhotoUrl}
                      alt={formData.author}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#0067b8] font-bold text-lg">
                      {formData.author ? formData.author.charAt(0).toUpperCase() : 'H'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-[#1a1a1a]">
                      {formData.author || 'Humberto Jezus'}
                    </span>
                    <span className="text-sm font-semibold text-[#505050]">{formData.readTime}</span>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 mb-10 shadow-xs">
                    <img
                      src={formData.imageUrl}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {formData.content ? (
                  <ArticleContent content={formData.content} />
                ) : (
                  <p className="text-gray-400 italic text-base">Nenhum conteúdo escrito ainda.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10"
            >
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">
                {isEditing ? t('adminEditor.editArticle') : t('adminEditor.createArticle')}
              </h1>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.title')}
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder={t('adminEditor.titlePlaceholder')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="excerpt" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.excerpt')}
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      required
                      rows={2}
                      value={formData.excerpt}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all resize-none"
                      placeholder={t('adminEditor.excerptPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.category')}
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder={t('adminEditor.categoryPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.language')}
                    </label>
                    <select
                      id="language"
                      name="language"
                      required
                      value={formData.language}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Cover Image (Upload from PC OR URL) */}
                  <div className="md:col-span-2">
                    <label htmlFor="imageUrl" className="block text-sm font-bold text-[#242424] mb-2">
                      Imagem de Capa (envie do computador ou cole uma URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        required={!formData.imageUrl}
                        value={formData.imageUrl.startsWith('data:image/') ? '' : formData.imageUrl}
                        onChange={handleChange}
                        className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-sm font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                        placeholder={
                          formData.imageUrl.startsWith('data:image/')
                            ? 'Imagem carregada do computador (ou cole uma URL para substituir)'
                            : t('adminEditor.coverImagePlaceholder')
                        }
                      />
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-bold text-[#0067b8] hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Subir do Computador
                      </button>
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-3 relative inline-block">
                        <img
                          src={formData.imageUrl}
                          alt="Prévia da capa"
                          className="h-36 w-64 object-cover rounded-lg border border-gray-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                          title="Remover imagem de capa"
                          className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Author Name */}
                  <div>
                    <label htmlFor="author" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.authorName')}
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder={t('adminEditor.authorNamePlaceholder')}
                    />
                  </div>

                  {/* Author Photo (Upload from PC OR URL) */}
                  <div>
                    <label htmlFor="authorPhotoUrl" className="block text-sm font-bold text-[#242424] mb-2">
                      Foto do Autor (computador ou URL)
                    </label>
                    <div className="flex items-center gap-2.5">
                      {formData.authorPhotoUrl ? (
                        <div className="relative shrink-0">
                          <img
                            src={formData.authorPhotoUrl}
                            alt={formData.author}
                            className="w-11 h-11 rounded-full object-cover border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, authorPhotoUrl: '' }))}
                            title="Remover foto"
                            className="absolute -top-1 -right-1 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-[#0067b8] font-bold text-base shrink-0">
                          {formData.author ? formData.author.charAt(0).toUpperCase() : 'H'}
                        </div>
                      )}
                      <input
                        type="text"
                        id="authorPhotoUrl"
                        name="authorPhotoUrl"
                        value={formData.authorPhotoUrl.startsWith('data:image/') ? '' : formData.authorPhotoUrl}
                        onChange={handleChange}
                        className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                        placeholder={
                          formData.authorPhotoUrl.startsWith('data:image/')
                            ? 'Foto carregada do computador'
                            : 'Cole URL ou clique em Subir'
                        }
                      />
                      <input
                        ref={authorFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAuthorPhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => authorFileInputRef.current?.click()}
                        title="Subir foto do computador"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-2.5 text-sm font-bold text-[#0067b8] hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Subir</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.date')}
                    </label>
                    <input
                      type="text"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder={t('adminEditor.datePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="readTime" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.readTime')}
                    </label>
                    <input
                      type="text"
                      id="readTime"
                      name="readTime"
                      required
                      value={formData.readTime}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder={t('adminEditor.readTimePlaceholder')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="content" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminEditor.content')}
                    </label>
                    <RichTextEditor value={formData.content} onChange={handleContentChange} />
                  </div>
                </div>

                <div className="pt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200">
                  <Link
                    to="/admin"
                    className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#242424] hover:bg-gray-50 transition-colors border border-gray-300 shadow-xs"
                  >
                    {t('adminEditor.cancel')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="rounded-lg bg-blue-50 border border-blue-200 px-6 py-3 text-sm font-bold text-[#0067b8] hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Pré-visualizar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0067b8] px-8 py-3 text-sm font-bold text-white hover:bg-[#005a9e] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('adminEditor.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditing ? t('adminEditor.updateArticle') : t('adminEditor.publishArticle')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
