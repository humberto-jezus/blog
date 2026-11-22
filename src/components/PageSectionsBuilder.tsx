import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  LayoutGrid,
  Images,
  Megaphone,
  Upload,
  Award,
} from 'lucide-react';
import { CustomPageSection, PageIconKey } from '../types';
import { PAGE_ICON_OPTIONS } from '../utils/pageDefaults';
import RichTextEditor from './RichTextEditor';

interface PageSectionsBuilderProps {
  sections: CustomPageSection[];
  onChange: (sections: CustomPageSection[]) => void;
  onError?: (msg: string) => void;
  sectionStartNumber?: number;
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
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
        const mime =
          file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
        resolve(canvas.toDataURL(mime, 0.88));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });
}

const TYPE_LABELS: Record<CustomPageSection['type'], string> = {
  text: 'Texto / Imagens / Código',
  cards: 'Grade de Cards',
  gallery: 'Galeria / Selos / Logos',
  cta: 'Banner com Botão (CTA)',
};

export default function PageSectionsBuilder({
  sections,
  onChange,
  onError,
  sectionStartNumber = 3,
}: PageSectionsBuilderProps) {
  const addSection = (type: CustomPageSection['type']) => {
    const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let newSection: CustomPageSection;

    if (type === 'text') {
      newSection = {
        id,
        type: 'text',
        title: 'Nova Seção de Conteúdo',
        subtitle: '',
        content: '<p>Escreva aqui o conteúdo desta seção, adicione imagens ou caixas de código.</p>',
      };
    } else if (type === 'cards') {
      newSection = {
        id,
        type: 'cards',
        title: 'Destaques / Serviços',
        subtitle: '',
        cards: [
          {
            icon: 'cloud',
            title: 'Card 1',
            description: 'Descrição do primeiro destaque.',
            link: '',
          },
          {
            icon: 'shield',
            title: 'Card 2',
            description: 'Descrição do segundo destaque.',
            link: '',
          },
        ],
      };
    } else if (type === 'gallery') {
      newSection = {
        id,
        type: 'gallery',
        title: 'Galeria / Selos',
        subtitle: '',
        gallery: [{ name: 'Item 1', imageUrl: '' }],
      };
    } else {
      newSection = {
        id,
        type: 'cta',
        title: 'Quer conversar sobre projetos Azure?',
        subtitle: 'Entre em contato ou acompanhe os novos artigos técnicos do blog.',
        buttonText: 'Ver Artigos',
        buttonLink: '/articles',
      };
    }

    onChange([...sections, newSection]);
  };

  const updateSection = (idx: number, patch: Partial<CustomPageSection>) => {
    const next = [...sections];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const moveSection = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const removeSection = (idx: number) => {
    onChange(sections.filter((_, i) => i !== idx));
  };

  const handleGalleryUpload = async (
    secIdx: number,
    itemIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Selecione uma imagem válida (PNG, JPG ou WebP).');
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      const sec = sections[secIdx];
      const nextGallery = [...(sec.gallery || [])];
      nextGallery[itemIdx] = { ...nextGallery[itemIdx], imageUrl: dataUrl };
      updateSection(secIdx, { gallery: nextGallery });
      onError?.('');
    } catch (err: any) {
      onError?.(err?.message || 'Erro ao carregar a imagem.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0067b8] bg-blue-50 px-2.5 py-1 rounded-md mb-1">
                Seção {sectionStartNumber + idx} · {TYPE_LABELS[section.type]}
              </span>
              <h3 className="text-lg font-bold text-[#1a1a1a]">
                {section.title || 'Seção sem título'}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveSection(idx, -1)}
                className="p-2 rounded-lg border border-gray-200 text-[#242424] hover:bg-gray-50 disabled:opacity-35 cursor-pointer"
                title="Subir seção"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={idx === sections.length - 1}
                onClick={() => moveSection(idx, 1)}
                className="p-2 rounded-lg border border-gray-200 text-[#242424] hover:bg-gray-50 disabled:opacity-35 cursor-pointer"
                title="Descer seção"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeSection(idx)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#242424] mb-1.5">
                Título da Seção
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(idx, { title: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-sm font-bold text-[#1a1a1a]"
                placeholder="Ex: Serviços, Agenda, Perguntas Frequentes..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#242424] mb-1.5">
                Subtítulo (opcional)
              </label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateSection(idx, { subtitle: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-sm font-medium text-[#1a1a1a]"
                placeholder="Breve descrição abaixo do título"
              />
            </div>
          </div>

          {/* TEXT SECTION */}
          {section.type === 'text' && (
            <div>
              <label className="block text-sm font-bold text-[#242424] mb-2">
                Conteúdo da Seção
              </label>
              <RichTextEditor
                value={section.content || ''}
                onChange={(val) => updateSection(idx, { content: val })}
              />
            </div>
          )}

          {/* CARDS SECTION */}
          {section.type === 'cards' && (
            <div className="space-y-4">
              {(section.cards || []).map((card, cIdx) => (
                <div
                  key={cIdx}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#0067b8]">
                      Card #{cIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextCards = (section.cards || []).filter((_, i) => i !== cIdx);
                        updateSection(idx, { cards: nextCards });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={card.icon}
                      onChange={(e) => {
                        const nextCards = [...(section.cards || [])];
                        nextCards[cIdx] = {
                          ...nextCards[cIdx],
                          icon: e.target.value as PageIconKey,
                        };
                        updateSection(idx, { cards: nextCards });
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
                      value={card.title}
                      onChange={(e) => {
                        const nextCards = [...(section.cards || [])];
                        nextCards[cIdx] = { ...nextCards[cIdx], title: e.target.value };
                        updateSection(idx, { cards: nextCards });
                      }}
                      className="sm:col-span-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-bold text-[#1a1a1a]"
                      placeholder="Título do card"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={card.description}
                    onChange={(e) => {
                      const nextCards = [...(section.cards || [])];
                      nextCards[cIdx] = { ...nextCards[cIdx], description: e.target.value };
                      updateSection(idx, { cards: nextCards });
                    }}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-[#1a1a1a]"
                    placeholder="Descrição do card"
                  />
                  <input
                    type="text"
                    value={card.link || ''}
                    onChange={(e) => {
                      const nextCards = [...(section.cards || [])];
                      nextCards[cIdx] = { ...nextCards[cIdx], link: e.target.value };
                      updateSection(idx, { cards: nextCards });
                    }}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-xs font-medium text-[#1a1a1a]"
                    placeholder="Link opcional ao clicar no card (ex: /articles ou https://...)"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  updateSection(idx, {
                    cards: [
                      ...(section.cards || []),
                      {
                        icon: 'cloud',
                        title: 'Novo Card',
                        description: 'Descrição do item.',
                        link: '',
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#0067b8] bg-blue-50/50 px-4 py-2 text-sm font-bold text-[#0067b8] hover:bg-blue-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Adicionar Card
              </button>
            </div>
          )}

          {/* GALLERY SECTION */}
          {section.type === 'gallery' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(section.gallery || []).map((item, gIdx) => (
                  <div
                    key={gIdx}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4"
                  >
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
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
                          value={item.name}
                          onChange={(e) => {
                            const nextGallery = [...(section.gallery || [])];
                            nextGallery[gIdx] = { ...nextGallery[gIdx], name: e.target.value };
                            updateSection(idx, { gallery: nextGallery });
                          }}
                          className="flex-1 rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-bold text-[#1a1a1a]"
                          placeholder="Legenda / Nome"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextGallery = (section.gallery || []).filter((_, i) => i !== gIdx);
                            updateSection(idx, { gallery: nextGallery });
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.imageUrl.startsWith('data:') ? '' : item.imageUrl}
                        onChange={(e) => {
                          const nextGallery = [...(section.gallery || [])];
                          nextGallery[gIdx] = { ...nextGallery[gIdx], imageUrl: e.target.value };
                          updateSection(idx, { gallery: nextGallery });
                        }}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs font-medium text-[#1a1a1a]"
                        placeholder={
                          item.imageUrl.startsWith('data:')
                            ? 'Imagem enviada do computador'
                            : 'URL da imagem ou envie abaixo'
                        }
                      />
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0067b8] hover:underline cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Enviar imagem do PC
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGalleryUpload(idx, gIdx, e)}
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
                  updateSection(idx, {
                    gallery: [...(section.gallery || []), { name: 'Novo Item', imageUrl: '' }],
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#0067b8] bg-blue-50/50 px-4 py-2 text-sm font-bold text-[#0067b8] hover:bg-blue-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Adicionar Item na Galeria
              </button>
            </div>
          )}

          {/* CTA SECTION */}
          {section.type === 'cta' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#242424] mb-1.5">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={section.buttonText || ''}
                  onChange={(e) => updateSection(idx, { buttonText: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-bold text-[#1a1a1a]"
                  placeholder="Ex: Agendar Mentoria, Falar no LinkedIn..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#242424] mb-1.5">
                  Link do Botão
                </label>
                <input
                  type="text"
                  value={section.buttonLink || ''}
                  onChange={(e) => updateSection(idx, { buttonLink: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-[#1a1a1a]"
                  placeholder="Ex: /articles ou https://linkedin.com/in/..."
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ADD NEW SECTION PANEL */}
      <div className="bg-blue-50/60 rounded-xl border-2 border-dashed border-[#0067b8]/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-1 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#0067b8]" />
          Adicionar Nova Seção na Página
        </h3>
        <p className="text-sm font-medium text-[#505050] mb-5">
          Escolha o tipo de bloco que deseja acrescentar abaixo — você pode adicionar quantas seções quiser e reordenar depois:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => addSection('text')}
            className="flex flex-col items-start gap-2 rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-[#0067b8] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-[#0067b8]">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Texto / Código / Imagem</span>
            <span className="text-xs text-[#505050]">Editor completo com fotos e scripts</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('cards')}
            className="flex flex-col items-start gap-2 rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-[#0067b8] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-[#0067b8]">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Grade de Cards</span>
            <span className="text-xs text-[#505050]">Serviços, módulos ou tópicos com ícone</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('gallery')}
            className="flex flex-col items-start gap-2 rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-[#0067b8] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-[#0067b8]">
              <Images className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Galeria / Selos</span>
            <span className="text-xs text-[#505050]">Logos, badges ou fotos do computador</span>
          </button>

          <button
            type="button"
            onClick={() => addSection('cta')}
            className="flex flex-col items-start gap-2 rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-[#0067b8] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-[#0067b8]">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Banner com Botão</span>
            <span className="text-xs text-[#505050]">Destaque escuro com botão de ação</span>
          </button>
        </div>
      </div>
    </div>
  );
}
