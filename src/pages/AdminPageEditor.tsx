import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Save,
  Loader2,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Upload,
  Award,
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import ArticleContent from '../components/ArticleContent';
import PageSectionsBuilder from '../components/PageSectionsBuilder';
import PageSectionsRenderer from '../components/PageSectionsRenderer';
import { useI18n } from '../contexts/I18nContext';
import { fetchPageById, createPage, updatePage } from '../utils/api';
import {
  AboutPageConfig,
  CustomPageSection,
  HomePageConfig,
  PageIconKey,
} from '../types';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_ABOUT_SUBTITLE,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_HOME_SUBTITLE,
  DEFAULT_HOME_TITLE,
  mergeAboutConfig,
  mergeHomeConfig,
  PAGE_ICON_MAP,
  PAGE_ICON_OPTIONS,
} from '../utils/pageDefaults';

import AdminSidebar from '../components/AdminSidebar';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function readBadgeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/png';
        resolve(canvas.toDataURL(mime, 0.9));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}

export default function AdminPageEditor() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const isHomePage = id === 'home';
  const isAboutPage = id === 'about';
  const isSystemPage = isHomePage || isAboutPage;
  const { t } = useI18n();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    subtitle: string;
    content: string;
    showInNav: boolean;
    homeConfig: HomePageConfig;
    aboutConfig: AboutPageConfig;
    sections: CustomPageSection[];
  }>({
    id: id || '',
    title: '',
    subtitle: '',
    content: '',
    showInNav: true,
    homeConfig: mergeHomeConfig(),
    aboutConfig: mergeAboutConfig(),
    sections: [],
  });

  useEffect(() => {
    if (isEditing && id && isAdmin) {
      const loadPage = async () => {
        try {
          const data = await fetchPageById(id);
          if (data) {
            const isSeededShortAbout =
              id === 'about' &&
              !data.aboutConfig &&
              (!data.content ||
                data.content.includes('Este blog é dedicado a compartilhar conhecimento'));

            setFormData({
              id: data.id,
              title:
                data.title ||
                (id === 'home' ? DEFAULT_HOME_TITLE : id === 'about' ? DEFAULT_ABOUT_TITLE : ''),
              subtitle:
                data.subtitle !== undefined && data.subtitle !== ''
                  ? data.subtitle
                  : id === 'about'
                    ? DEFAULT_ABOUT_SUBTITLE
                    : '',
              content: isSeededShortAbout
                ? DEFAULT_ABOUT_CONTENT
                : data.content || (id === 'home' ? `<p>${DEFAULT_HOME_SUBTITLE}</p>` : ''),
              showInNav: Boolean(data.showInNav),
              homeConfig: mergeHomeConfig(data.homeConfig),
              aboutConfig: mergeAboutConfig(data.aboutConfig),
              sections: Array.isArray(data.sections) ? data.sections : [],
            });
          } else {
            setFormData({
              id,
              title: id === 'home' ? DEFAULT_HOME_TITLE : DEFAULT_ABOUT_TITLE,
              subtitle: id === 'about' ? DEFAULT_ABOUT_SUBTITLE : '',
              content:
                id === 'home'
                  ? `<p>${DEFAULT_HOME_SUBTITLE}</p>`
                  : id === 'about'
                    ? DEFAULT_ABOUT_CONTENT
                    : '',
              showInNav: false,
              homeConfig: mergeHomeConfig(),
              aboutConfig: mergeAboutConfig(),
              sections: [],
            });
          }
        } catch (err) {
          console.error('Error fetching page:', err);
          setError(t('adminPageEditor.failedToLoad'));
        } finally {
          setLoading(false);
        }
      };
      loadPage();
    }
  }, [id, isEditing, isAdmin, t]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      id: !isEditing && !slugTouched ? slugify(newTitle) : prev.id,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setFormData((prev) => ({ ...prev, id: slugify(e.target.value) }));
  };

  const updateHomeConfig = (patch: Partial<HomePageConfig>) => {
    setFormData((prev) => ({
      ...prev,
      homeConfig: { ...prev.homeConfig, ...patch },
    }));
  };

  const updateAboutConfig = (patch: Partial<AboutPageConfig>) => {
    setFormData((prev) => ({
      ...prev,
      aboutConfig: { ...prev.aboutConfig, ...patch },
    }));
  };

  const handleCertFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida (PNG, JPG, WebP ou SVG).');
      return;
    }
    try {
      const dataUrl = await readBadgeImage(file);
      const next = [...formData.aboutConfig.certifications];
      next[index] = { ...next[index], imageUrl: dataUrl };
      updateAboutConfig({ certifications: next });
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar a imagem da certificação.');
    }
    e.target.value = '';
  };

  const savePage = async () => {
    if (!user || !isAdmin) return;

    if (!formData.title.trim()) {
      setError('Informe o título da página.');
      setShowPreview(false);
      return;
    }

    if (!isEditing && !formData.id.trim()) {
      setError('Informe um endereço (slug) válido para a nova página.');
      setShowPreview(false);
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing && id) {
        await updatePage(id, {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          showInNav: isSystemPage ? false : formData.showInNav,
          ...(isHomePage ? { homeConfig: formData.homeConfig } : {}),
          ...(isAboutPage ? { aboutConfig: formData.aboutConfig } : {}),
          sections: formData.sections,
        });
      } else {
        await createPage({
          id: formData.id,
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          showInNav: formData.showInNav,
          sections: formData.sections,
        });
      }
      window.dispatchEvent(new Event('pages-updated'));
      navigate('/admin/pages');
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError(err?.message || t('adminPageEditor.failedToSave'));
      setShowPreview(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePage();
  };

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8] text-lg font-semibold text-[#505050]">
        {t('adminPageEditor.loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#faf9f8] min-h-screen font-sans">
      <AdminSidebar />

      <main className="flex-1 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              to="/admin/pages"
              className="inline-flex items-center gap-1.5 text-[#0067b8] hover:underline transition-colors text-base font-bold"
            >
              <ChevronLeft className="h-5 w-5" />
              {t('adminPageEditor.backToPages')}
            </Link>

            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
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
                  Pré-visualizar Página Inteira
                </>
              )}
            </button>
          </div>

          {showPreview ? (
            <motion.div
              key="page-preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#faf9f8] rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50 border-b border-blue-100 px-6 py-4">
                <span className="text-sm font-bold text-[#0067b8] flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Pré-visualização Completa (
                  {isSystemPage ? `/${id === 'home' ? '' : id}` : `/p/${formData.id || 'nova-pagina'}`})
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-[#242424] hover:bg-gray-50 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={savePage}
                    className="rounded-lg bg-[#0067b8] px-5 py-2 text-sm font-bold text-white hover:bg-[#005a9e] flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEditing ? t('adminPageEditor.updatePage') : 'Criar Página'}
                  </button>
                </div>
              </div>

              {/* Hero Preview */}
              <div className="bg-[#010510] py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                    {formData.title || 'Título da Página'}
                  </h1>
                  {isHomePage ? (
                    <>
                      {formData.content && (
                        <div
                          className="prose prose-invert max-w-2xl mx-auto mb-8 prose-p:text-white/95 prose-p:text-lg"
                          dangerouslySetInnerHTML={{ __html: formData.content }}
                        />
                      )}
                      <div className="flex flex-wrap justify-center gap-3">
                        {formData.homeConfig.primaryButtonText && (
                          <span className="bg-[#0067b8] text-white px-7 py-3 rounded-lg text-base font-bold">
                            {formData.homeConfig.primaryButtonText}
                          </span>
                        )}
                        {formData.homeConfig.secondaryButtonText && (
                          <span className="border-2 border-white/40 bg-white/10 text-white px-7 py-3 rounded-lg text-base font-bold">
                            {formData.homeConfig.secondaryButtonText}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    formData.subtitle && (
                      <p className="text-lg md:text-xl font-medium text-white/90 mt-4 leading-relaxed">
                        {formData.subtitle}
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* Body Preview */}
              <div className="p-6 sm:p-10 space-y-12">
                {isHomePage && (
                  <>
                    {formData.homeConfig.extraContent?.trim() && (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                        <ArticleContent content={formData.homeConfig.extraContent} />
                      </div>
                    )}
                    {formData.homeConfig.showLatestPosts && (
                      <div>
                        <p className="text-xs font-bold text-[#0067b8] uppercase tracking-wider mb-1">
                          {formData.homeConfig.postsEyebrow}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold text-[#1a1a1a]">
                            {formData.homeConfig.postsTitle}
                          </h2>
                          <span className="text-sm font-bold text-[#0067b8]">
                            {formData.homeConfig.postsViewAllText} →
                          </span>
                        </div>
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm font-semibold text-gray-500">
                          Aqui aparece automaticamente a grade com seus artigos publicados.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isAboutPage && (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                      <ArticleContent content={formData.content} />
                    </div>

                    {formData.aboutConfig.showSpecialties &&
                      formData.aboutConfig.specialties.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-6">
                            {formData.aboutConfig.specialtiesTitle}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.aboutConfig.specialties.map((spec, idx) => {
                              const Icon = PAGE_ICON_MAP[spec.icon] || PAGE_ICON_MAP.shield;
                              return (
                                <div
                                  key={idx}
                                  className="bg-white border border-gray-200 rounded-xl p-6"
                                >
                                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                    <Icon className="h-5 w-5 text-[#0067b8]" />
                                  </div>
                                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">
                                    {spec.title}
                                  </h3>
                                  <p className="text-sm text-[#4a4a4a]">{spec.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {formData.aboutConfig.showCertifications &&
                      formData.aboutConfig.certifications.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-6">
                            {formData.aboutConfig.certificationsTitle}
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.aboutConfig.certifications.map((cert, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                              >
                                {cert.imageUrl ? (
                                  <img
                                    src={cert.imageUrl}
                                    alt={cert.name}
                                    className="w-16 h-16 object-contain"
                                  />
                                ) : (
                                  <Award className="w-12 h-12 text-[#0067b8]" />
                                )}
                                <span className="text-sm font-bold text-[#1a1a1a]">{cert.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {formData.aboutConfig.showCommunity &&
                      formData.aboutConfig.community.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-6">
                            {formData.aboutConfig.communityTitle}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.aboutConfig.community.map((block, idx) => {
                              const Icon = PAGE_ICON_MAP[block.icon] || PAGE_ICON_MAP.rocket;
                              return (
                                <div
                                  key={idx}
                                  className="bg-white border border-gray-200 rounded-xl p-6"
                                >
                                  <div className="flex items-center gap-2.5 mb-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                      <Icon className="h-5 w-5 text-[#0067b8]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1a1a1a]">
                                      {block.title}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-[#4a4a4a] mb-3">{block.description}</p>
                                  {block.highlights.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {block.highlights.map((h, i) => (
                                        <li key={i} className="text-sm font-semibold text-[#242424]">
                                          • {h}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </>
                )}

                {!isSystemPage && (formData.content?.trim() || formData.sections.length === 0) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
                    {formData.content ? (
                      <ArticleContent content={formData.content} />
                    ) : (
                      <p className="text-gray-400 italic">Nenhum conteúdo escrito ainda.</p>
                    )}
                  </div>
                )}

                {formData.sections.length > 0 && (
                  <PageSectionsRenderer sections={formData.sections} />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="page-editor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                  {isEditing ? `${t('adminPageEditor.editPage')}: ${formData.title}` : 'Criar Nova Página'}
                </h1>
                <p className="text-sm font-medium text-[#505050]">
                  {isHomePage
                    ? 'Edite todas as seções da Página Inicial: banner principal, botões, bloco extra opcional e seção de artigos.'
                    : isAboutPage
                      ? 'Edite a página Sobre Mim inteira: topo, biografia, especialidades, certificações e comunidade.'
                      : 'Crie ou edite toda a estrutura desta página (título, subtítulo, texto, imagens e blocos de código).'}
                </p>

                {error && (
                  <div className="mt-5 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
                    {error}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION 1: HERO / TOPO */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
                  <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-gray-200 pb-3">
                    1. Banner Principal (Topo da Página)
                  </h2>

                  <div>
                    <label htmlFor="title" className="block text-sm font-bold text-[#242424] mb-2">
                      {t('adminPageEditor.title')}
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20 transition-all"
                      placeholder="Ex: Humberto Jezus, Sobre Mim, Mentoria Azure..."
                    />
                  </div>

                  {!isHomePage && (
                    <div>
                      <label htmlFor="subtitle" className="block text-sm font-bold text-[#242424] mb-2">
                        Subtítulo do Banner (opcional)
                      </label>
                      <textarea
                        id="subtitle"
                        rows={2}
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] shadow-xs focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20"
                        placeholder="Texto de destaque que aparece logo abaixo do título no banner escuro"
                      />
                    </div>
                  )}

                  {!isEditing && (
                    <div>
                      <label htmlFor="slug" className="block text-sm font-bold text-[#242424] mb-2">
                        Endereço da Página (URL)
                      </label>
                      <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:border-[#0067b8] focus-within:ring-2 focus-within:ring-[#0067b8]/20">
                        <span className="px-3.5 py-2.5 text-sm font-bold text-[#505050] border-r border-gray-300">
                          /p/
                        </span>
                        <input
                          type="text"
                          id="slug"
                          required
                          value={formData.id}
                          onChange={handleSlugChange}
                          className="flex-1 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a] focus:outline-none"
                          placeholder="mentoria-azure"
                        />
                      </div>
                    </div>
                  )}

                  {!isSystemPage && (
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showInNav}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showInNav: e.target.checked }))
                        }
                        className="h-5 w-5 rounded border-gray-300 text-[#0067b8] focus:ring-[#0067b8]"
                      />
                      <div>
                        <span className="block text-sm font-bold text-[#1a1a1a]">
                          Mostrar esta página no menu superior do blog
                        </span>
                        <span className="block text-xs font-medium text-[#505050]">
                          Quando marcado, o link da página aparece automaticamente ao lado de Início, Artigos e Sobre Mim.
                        </span>
                      </div>
                    </label>
                  )}

                  {isHomePage && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-[#242424] mb-2">
                          Texto de Apresentação do Banner
                        </label>
                        <RichTextEditor
                          value={formData.content}
                          onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                          <span className="block text-sm font-bold text-[#0067b8]">
                            Botão Principal (Azul)
                          </span>
                          <input
                            type="text"
                            value={formData.homeConfig.primaryButtonText}
                            onChange={(e) =>
                              updateHomeConfig({ primaryButtonText: e.target.value })
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                            placeholder="Texto do botão (deixe vazio para ocultar)"
                          />
                          <input
                            type="text"
                            value={formData.homeConfig.primaryButtonLink}
                            onChange={(e) =>
                              updateHomeConfig({ primaryButtonLink: e.target.value })
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                            placeholder="Link (ex: /articles ou https://...)"
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                          <span className="block text-sm font-bold text-[#242424]">
                            Botão Secundário (Borda)
                          </span>
                          <input
                            type="text"
                            value={formData.homeConfig.secondaryButtonText}
                            onChange={(e) =>
                              updateHomeConfig({ secondaryButtonText: e.target.value })
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                            placeholder="Texto do botão (deixe vazio para ocultar)"
                          />
                          <input
                            type="text"
                            value={formData.homeConfig.secondaryButtonLink}
                            onChange={(e) =>
                              updateHomeConfig({ secondaryButtonLink: e.target.value })
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                            placeholder="Link (ex: /about ou /p/contato)"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* HOME EXTRA SECTIONS */}
                {isHomePage && (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-gray-200 pb-3">
                        2. Bloco de Conteúdo Personalizado na Home (Opcional)
                      </h2>
                      <p className="text-sm font-medium text-[#505050]">
                        Adicione texto de boas-vindas, avisos, imagens, links ou caixas de código entre o banner e a lista de artigos. Se deixar vazio, o bloco não aparece.
                      </p>
                      <RichTextEditor
                        value={formData.homeConfig.extraContent || ''}
                        onChange={(value) => updateHomeConfig({ extraContent: value })}
                      />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <h2 className="text-xl font-bold text-[#1a1a1a]">
                          3. Seção de Artigos Recentes
                        </h2>
                        <label className="inline-flex items-center gap-2 text-sm font-bold text-[#242424] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.homeConfig.showLatestPosts}
                            onChange={(e) =>
                              updateHomeConfig({ showLatestPosts: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#0067b8]"
                          />
                          Exibir esta seção na Home
                        </label>
                      </div>

                      {formData.homeConfig.showLatestPosts && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Texto Superior (Tag)
                            </label>
                            <input
                              type="text"
                              value={formData.homeConfig.postsEyebrow}
                              onChange={(e) =>
                                updateHomeConfig({ postsEyebrow: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-[#1a1a1a]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Título da Seção
                            </label>
                            <input
                              type="text"
                              value={formData.homeConfig.postsTitle}
                              onChange={(e) =>
                                updateHomeConfig({ postsTitle: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-[#1a1a1a]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Texto do Link “Ver todos”
                            </label>
                            <input
                              type="text"
                              value={formData.homeConfig.postsViewAllText}
                              onChange={(e) =>
                                updateHomeConfig({ postsViewAllText: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-[#1a1a1a]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ABOUT & CUSTOM PAGE MAIN CONTENT */}
                {!isHomePage && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
                    <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-gray-200 pb-3">
                      {isAboutPage ? '2. Biografia / Texto Principal' : '2. Conteúdo Completo da Página'}
                    </h2>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    />
                  </div>
                )}

                {/* ABOUT FULL-PAGE SECTIONS */}
                {isAboutPage && (
                  <>
                    {/* 3. Specialties */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <h2 className="text-xl font-bold text-[#1a1a1a]">
                          3. Seção de Especialidades
                        </h2>
                        <label className="inline-flex items-center gap-2 text-sm font-bold text-[#242424] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.aboutConfig.showSpecialties}
                            onChange={(e) =>
                              updateAboutConfig({ showSpecialties: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#0067b8]"
                          />
                          Exibir esta seção
                        </label>
                      </div>

                      {formData.aboutConfig.showSpecialties && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Título da Seção
                            </label>
                            <input
                              type="text"
                              value={formData.aboutConfig.specialtiesTitle}
                              onChange={(e) =>
                                updateAboutConfig({ specialtiesTitle: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a]"
                            />
                          </div>

                          <div className="space-y-4">
                            {formData.aboutConfig.specialties.map((spec, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#0067b8]">
                                    Especialidade #{idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = formData.aboutConfig.specialties.filter(
                                        (_, i) => i !== idx
                                      );
                                      updateAboutConfig({ specialties: next });
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remover
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <select
                                    value={spec.icon}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.specialties];
                                      next[idx] = {
                                        ...next[idx],
                                        icon: e.target.value as PageIconKey,
                                      };
                                      updateAboutConfig({ specialties: next });
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                                  >
                                    {PAGE_ICON_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={spec.title}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.specialties];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      updateAboutConfig({ specialties: next });
                                    }}
                                    className="sm:col-span-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-bold text-[#1a1a1a]"
                                    placeholder="Título da especialidade"
                                  />
                                </div>
                                <textarea
                                  rows={2}
                                  value={spec.description}
                                  onChange={(e) => {
                                    const next = [...formData.aboutConfig.specialties];
                                    next[idx] = { ...next[idx], description: e.target.value };
                                    updateAboutConfig({ specialties: next });
                                  }}
                                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                                  placeholder="Descrição da especialidade"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() =>
                                updateAboutConfig({
                                  specialties: [
                                    ...formData.aboutConfig.specialties,
                                    {
                                      icon: 'cloud',
                                      title: 'Nova Especialidade',
                                      description: 'Descreva sua atuação nesta área.',
                                    },
                                  ],
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#0067b8] bg-blue-50/50 px-4 py-2.5 text-sm font-bold text-[#0067b8] hover:bg-blue-50 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Especialidade
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 4. Certifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <h2 className="text-xl font-bold text-[#1a1a1a]">
                          4. Seção de Certificações
                        </h2>
                        <label className="inline-flex items-center gap-2 text-sm font-bold text-[#242424] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.aboutConfig.showCertifications}
                            onChange={(e) =>
                              updateAboutConfig({ showCertifications: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#0067b8]"
                          />
                          Exibir esta seção
                        </label>
                      </div>

                      {formData.aboutConfig.showCertifications && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Título da Seção
                            </label>
                            <input
                              type="text"
                              value={formData.aboutConfig.certificationsTitle}
                              onChange={(e) =>
                                updateAboutConfig({ certificationsTitle: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.aboutConfig.certifications.map((cert, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4"
                              >
                                <div className="w-16 h-16 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-1">
                                  {cert.imageUrl ? (
                                    <img
                                      src={cert.imageUrl}
                                      alt={cert.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Award className="h-8 w-8 text-[#0067b8]" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={cert.name}
                                      onChange={(e) => {
                                        const next = [...formData.aboutConfig.certifications];
                                        next[idx] = { ...next[idx], name: e.target.value };
                                        updateAboutConfig({ certifications: next });
                                      }}
                                      className="flex-1 rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-bold text-[#1a1a1a]"
                                      placeholder="Ex: AZ-305"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = formData.aboutConfig.certifications.filter(
                                          (_, i) => i !== idx
                                        );
                                        updateAboutConfig({ certifications: next });
                                      }}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                      title="Remover certificação"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={cert.imageUrl.startsWith('data:') ? '' : cert.imageUrl}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.certifications];
                                      next[idx] = { ...next[idx], imageUrl: e.target.value };
                                      updateAboutConfig({ certifications: next });
                                    }}
                                    className="block w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs font-medium text-[#1a1a1a]"
                                    placeholder={
                                      cert.imageUrl.startsWith('data:')
                                        ? 'Imagem enviada do computador'
                                        : 'URL da imagem do selo ou envie abaixo'
                                    }
                                  />
                                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0067b8] hover:underline cursor-pointer">
                                    <Upload className="h-3.5 w-3.5" />
                                    Enviar selo do PC
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleCertFileUpload(idx, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateAboutConfig({
                                certifications: [
                                  ...formData.aboutConfig.certifications,
                                  { name: 'Nova Certificação', imageUrl: '' },
                                ],
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#0067b8] bg-blue-50/50 px-4 py-2.5 text-sm font-bold text-[#0067b8] hover:bg-blue-50 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Certificação
                          </button>
                        </>
                      )}
                    </div>

                    {/* 5. Community */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                        <h2 className="text-xl font-bold text-[#1a1a1a]">
                          5. Seção Comunidade & Liderança
                        </h2>
                        <label className="inline-flex items-center gap-2 text-sm font-bold text-[#242424] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.aboutConfig.showCommunity}
                            onChange={(e) =>
                              updateAboutConfig({ showCommunity: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#0067b8]"
                          />
                          Exibir esta seção
                        </label>
                      </div>

                      {formData.aboutConfig.showCommunity && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-[#242424] mb-1.5">
                              Título da Seção
                            </label>
                            <input
                              type="text"
                              value={formData.aboutConfig.communityTitle}
                              onChange={(e) =>
                                updateAboutConfig({ communityTitle: e.target.value })
                              }
                              className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-base font-medium text-[#1a1a1a]"
                            />
                          </div>

                          <div className="space-y-4">
                            {formData.aboutConfig.community.map((block, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#0067b8]">
                                    Bloco #{idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = formData.aboutConfig.community.filter(
                                        (_, i) => i !== idx
                                      );
                                      updateAboutConfig({ community: next });
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remover
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <select
                                    value={block.icon}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.community];
                                      next[idx] = {
                                        ...next[idx],
                                        icon: e.target.value as PageIconKey,
                                      };
                                      updateAboutConfig({ community: next });
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                                  >
                                    {PAGE_ICON_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={block.title}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.community];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      updateAboutConfig({ community: next });
                                    }}
                                    className="sm:col-span-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-bold text-[#1a1a1a]"
                                    placeholder="Título (ex: Azure Training, Microsoft Reactor)"
                                  />
                                </div>

                                <textarea
                                  rows={2}
                                  value={block.description}
                                  onChange={(e) => {
                                    const next = [...formData.aboutConfig.community];
                                    next[idx] = { ...next[idx], description: e.target.value };
                                    updateAboutConfig({ community: next });
                                  }}
                                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                                  placeholder="Descrição principal deste bloco"
                                />

                                <div>
                                  <label className="block text-xs font-bold text-[#505050] mb-1">
                                    Tópicos / Destaques (um por linha, opcional)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={(block.highlights || []).join('\n')}
                                    onChange={(e) => {
                                      const next = [...formData.aboutConfig.community];
                                      next[idx] = {
                                        ...next[idx],
                                        highlights: e.target.value
                                          .split('\n')
                                          .map((line) => line.trim())
                                          .filter(Boolean),
                                      };
                                      updateAboutConfig({ community: next });
                                    }}
                                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                                    placeholder={'Ex:\nWorkshops práticos\nMentoria individual'}
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() =>
                                updateAboutConfig({
                                  community: [
                                    ...formData.aboutConfig.community,
                                    {
                                      icon: 'users',
                                      title: 'Novo Projeto / Comunidade',
                                      description: 'Descreva sua participação ou projeto.',
                                      highlights: [],
                                    },
                                  ],
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#0067b8] bg-blue-50/50 px-4 py-2.5 text-sm font-bold text-[#0067b8] hover:bg-blue-50 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Bloco de Comunidade
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* DYNAMIC CUSTOM SECTIONS BUILDER (works on new pages AND system pages) */}
                <PageSectionsBuilder
                  sections={formData.sections}
                  onChange={(nextSections) =>
                    setFormData((prev) => ({ ...prev, sections: nextSections }))
                  }
                  onError={setError}
                  sectionStartNumber={isAboutPage ? 6 : isHomePage ? 4 : 3}
                />

                {/* SAVE BAR */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap justify-end gap-3">
                  <Link
                    to="/admin/pages"
                    className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#242424] hover:bg-gray-50 transition-colors border border-gray-300 shadow-xs"
                  >
                    {t('adminPageEditor.cancel')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="rounded-lg bg-blue-50 border border-blue-200 px-6 py-3 text-sm font-bold text-[#0067b8] hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Pré-visualizar Página Inteira
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0067b8] px-8 py-3 text-sm font-bold text-white hover:bg-[#005a9e] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('adminPageEditor.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditing ? t('adminPageEditor.updatePage') : 'Criar Página'}
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
