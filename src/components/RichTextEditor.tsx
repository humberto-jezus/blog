import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Link as LinkIcon,
  Image as ImageIcon,
  RemoveFormatting,
  Code2,
  Eye,
  Upload,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const CODE_LANGUAGES = [
  { value: 'powershell', label: 'PowerShell' },
  { value: 'terraform', label: 'Terraform (HCL)' },
  { value: 'bicep', label: 'Azure Bicep' },
  { value: 'bash', label: 'Bash / Azure CLI' },
  { value: 'yaml', label: 'YAML' },
  { value: 'json', label: 'JSON' },
  { value: 'python', label: 'Python' },
  { value: 'csharp', label: 'C#' },
  { value: 'sql', label: 'SQL' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'text', label: 'Outro / Texto' },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function compressImageFile(file: File, maxWidth = 1280, maxHeight = 960, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao processar imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva seu artigo aqui... Você também pode colar prints (Ctrl+V) diretamente no texto!',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [panel, setPanel] = useState<'link' | 'image' | 'code' | null>(null);

  // Link & Image state
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Code Block composer state
  const [codeLang, setCodeLang] = useState('powershell');
  const [codeSnippet, setCodeSnippet] = useState('');

  // Sync external value updates into contentEditable without resetting cursor during typing
  useEffect(() => {
    if (mode !== 'visual') return;
    const el = editorRef.current;
    if (!el) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value, mode]);

  const saveSelection = () => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChangeRef.current = true;
    onChange(el.innerHTML);
  };

  /**
   * Reliably inserts an HTML block at the saved cursor range inside the editor,
   * or appends it at the end if the editor had no active cursor selection.
   */
  const insertHtmlAtCursor = (html: string) => {
    const el = editorRef.current;
    if (!el) return;

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const fragment = template.content;
    const lastInsertedNode = fragment.lastChild;

    el.focus();
    const selection = window.getSelection();

    if (savedSelectionRef.current && el.contains(savedSelectionRef.current.commonAncestorContainer)) {
      const range = savedSelectionRef.current.cloneRange();
      range.deleteContents();
      range.insertNode(fragment);

      if (lastInsertedNode && selection) {
        const nextRange = document.createRange();
        nextRange.setStartAfter(lastInsertedNode);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
        savedSelectionRef.current = nextRange.cloneRange();
      }
    } else {
      el.appendChild(fragment);
      if (lastInsertedNode && selection) {
        const nextRange = document.createRange();
        nextRange.setStartAfter(lastInsertedNode);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
        savedSelectionRef.current = nextRange.cloneRange();
      }
    }

    emitChange();
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    if (savedSelectionRef.current && editorRef.current?.contains(savedSelectionRef.current.commonAncestorContainer)) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
    document.execCommand(command, false, arg);
    saveSelection();
    emitChange();
  };

  const togglePanel = (next: 'link' | 'image' | 'code') => {
    saveSelection();
    setUrlInput('');
    setCaptionInput('');
    setCodeSnippet('');
    setPanel((prev) => (prev === next ? null : next));
  };

  const handleInsertLink = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setPanel(null);
      return;
    }
    const safeUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const label = captionInput.trim() || safeUrl;

    if (savedSelectionRef.current && !savedSelectionRef.current.collapsed) {
      exec('createLink', safeUrl);
    } else {
      insertHtmlAtCursor(
        `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>&nbsp;`
      );
    }
    setPanel(null);
    setUrlInput('');
    setCaptionInput('');
  };

  const insertImageHtml = (src: string, caption?: string) => {
    const cleanCaption = (caption || '').trim();
    const figCaptionHtml = cleanCaption
      ? `<figcaption>${escapeHtml(cleanCaption)}</figcaption>`
      : '';
    insertHtmlAtCursor(
      `<figure class="my-5"><img src="${src}" alt="${escapeHtml(cleanCaption || 'Imagem do artigo')}" />${figCaptionHtml}</figure><p><br></p>`
    );
  };

  const handleInsertImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const safeUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    insertImageHtml(escapeHtml(safeUrl), captionInput);
    setPanel(null);
    setUrlInput('');
    setCaptionInput('');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file);
      insertImageHtml(dataUrl, captionInput);
      setPanel(null);
      setCaptionInput('');
    } catch (err) {
      console.error('Error uploading inline image:', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleInsertCodeBlock = () => {
    const code = codeSnippet.replace(/\r\n/g, '\n');
    if (!code.trim()) return;
    const safeCode = escapeHtml(code);
    insertHtmlAtCursor(
      `<pre data-lang="${escapeHtml(codeLang)}"><code class="language-${escapeHtml(codeLang)}">${safeCode}</code></pre><p><br></p>`
    );
    setPanel(null);
    setCodeSnippet('');
  };

  // Support Ctrl+V pasting screenshots directly into the article body
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      saveSelection();
      try {
        const dataUrl = await compressImageFile(file);
        insertImageHtml(dataUrl);
      } catch (err) {
        console.error('Error pasting image:', err);
      }
    }
  };

  const formatButtons = [
    { icon: Heading2, label: 'Título H2', action: () => exec('formatBlock', '<h2>') },
    { icon: Heading3, label: 'Subtítulo H3', action: () => exec('formatBlock', '<h3>') },
    { icon: Bold, label: 'Negrito', action: () => exec('bold') },
    { icon: Italic, label: 'Itálico', action: () => exec('italic') },
    { icon: Underline, label: 'Sublinhado', action: () => exec('underline') },
    { icon: Strikethrough, label: 'Tachado', action: () => exec('strikeThrough') },
    { icon: List, label: 'Lista com marcadores', action: () => exec('insertUnorderedList') },
    { icon: ListOrdered, label: 'Lista numerada', action: () => exec('insertOrderedList') },
    { icon: Quote, label: 'Citação', action: () => exec('formatBlock', '<blockquote>') },
    { icon: RemoveFormatting, label: 'Limpar formatação', action: () => exec('removeFormat') },
  ];

  return (
    <div className="rounded-xl border border-gray-300 bg-white overflow-hidden shadow-xs focus-within:border-[#0067b8] focus-within:ring-2 focus-within:ring-[#0067b8]/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {mode === 'visual' && (
            <>
              {formatButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    btn.action();
                  }}
                  title={btn.label}
                  className="p-2 rounded-md text-[#242424] hover:bg-white hover:text-[#0067b8] hover:shadow-xs transition-colors cursor-pointer"
                >
                  <btn.icon className="h-4 w-4" />
                </button>
              ))}

              <div className="h-5 w-px bg-gray-300 mx-1" />

              {/* Dedicated Code Block Button */}
              <button
                type="button"
                onClick={() => togglePanel('code')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  panel === 'code'
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-white border border-gray-200 text-[#1a1a1a] hover:border-[#0067b8] hover:text-[#0067b8]'
                }`}
                title="Inserir caixa de código (PowerShell, Terraform, Bicep, Bash...)"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Código</span>
              </button>

              {/* Dedicated Image Upload/URL Button */}
              <button
                type="button"
                onClick={() => togglePanel('image')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  panel === 'image'
                    ? 'bg-[#0067b8] text-white'
                    : 'bg-white border border-gray-200 text-[#1a1a1a] hover:border-[#0067b8] hover:text-[#0067b8]'
                }`}
                title="Adicionar imagem no corpo do artigo (upload do computador ou URL)"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Imagem</span>
              </button>

              {/* Dedicated Link Button */}
              <button
                type="button"
                onClick={() => togglePanel('link')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  panel === 'link'
                    ? 'bg-[#0067b8] text-white'
                    : 'bg-white border border-gray-200 text-[#1a1a1a] hover:border-[#0067b8] hover:text-[#0067b8]'
                }`}
                title="Inserir link"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Link</span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setPanel(null);
            setMode((m) => (m === 'visual' ? 'html' : 'visual'));
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#242424] hover:text-[#0067b8] hover:border-[#0067b8] transition-colors cursor-pointer"
        >
          {mode === 'visual' ? (
            <>
              <Code2 className="h-3.5 w-3.5" />
              HTML
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Visual
            </>
          )}
        </button>
      </div>

      {/* Code Block Composer Panel */}
      {panel === 'code' && mode === 'visual' && (
        <div className="border-b border-slate-700 bg-[#0f172a] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-bold text-white">Inserir Caixa de Código</span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="code-lang-select" className="text-xs font-bold text-slate-300">
                Linguagem:
              </label>
              <select
                id="code-lang-select"
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:border-sky-400 focus:outline-none"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const target = e.currentTarget;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const next = codeSnippet.substring(0, start) + '  ' + codeSnippet.substring(end);
                setCodeSnippet(next);
                requestAnimationFrame(() => {
                  target.selectionStart = target.selectionEnd = start + 2;
                });
              }
            }}
            rows={7}
            placeholder={
              codeLang === 'powershell'
                ? 'Connect-AzAccount\nGet-AzResourceGroup | Format-Table'
                : codeLang === 'terraform'
                ? 'resource "azurerm_resource_group" "rg" {\n  name     = "rg-prod"\n  location = "brazilsouth"\n}'
                : 'Cole ou digite seu script / código aqui...'
            }
            className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none resize-y"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleInsertCodeBlock}
              disabled={!codeSnippet.trim()}
              className="rounded-md bg-[#0067b8] px-5 py-2 text-xs font-bold text-white hover:bg-[#005a9e] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Inserir Caixa de Código
            </button>
          </div>
        </div>
      )}

      {/* Inline Image Upload / URL Panel */}
      {panel === 'image' && mode === 'visual' && (
        <div className="border-b border-blue-100 bg-blue-50/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-[#1a1a1a]">
              Adicionar Imagem no Corpo do Artigo
            </span>
            <span className="text-xs font-medium text-[#505050]">
              Dica: você também pode colar prints com Ctrl+V direto no texto
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Cole a URL da imagem (https://...)"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0067b8] focus:outline-none"
            />
            <input
              type="text"
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="Legenda da imagem (opcional)"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0067b8] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => inlineImageInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0067b8] px-4 py-2 text-xs font-bold text-white hover:bg-[#005a9e] transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingImage ? 'Enviando...' : 'Subir Imagem do Computador'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {urlInput.trim() && (
                <button
                  type="button"
                  onClick={handleInsertImageUrl}
                  className="rounded-lg bg-white border border-[#0067b8] px-4 py-2 text-xs font-bold text-[#0067b8] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Inserir URL
                </button>
              )}
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-bold text-[#404040] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Link Panel */}
      {panel === 'link' && mode === 'visual' && (
        <div className="border-b border-blue-100 bg-blue-50/70 p-4 flex flex-wrap items-center gap-2.5">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInsertLink();
              }
            }}
            placeholder="https://learn.microsoft.com/..."
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0067b8] focus:outline-none"
            autoFocus
          />
          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Texto do link (opcional)"
            className="flex-1 min-w-[160px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#0067b8] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="rounded-lg bg-[#0067b8] px-4 py-2 text-xs font-bold text-white hover:bg-[#005a9e] transition-colors cursor-pointer"
          >
            Inserir Link
          </button>
          <button
            type="button"
            onClick={() => setPanel(null)}
            className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-bold text-[#404040] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Editor Surface */}
      {mode === 'visual' ? (
        <div className="relative">
          {!value && (
            <div className="pointer-events-none absolute top-4 left-4 right-4 text-gray-400 text-base">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={() => {
              saveSelection();
              emitChange();
            }}
            onPaste={handlePaste}
            className="prose prose-base sm:prose-lg max-w-none min-h-[360px] max-h-[650px] overflow-y-auto p-5 text-[#1a1a1a] focus:outline-none prose-headings:font-bold prose-a:text-[#0067b8] prose-img:rounded-xl prose-img:max-h-[420px] prose-img:object-contain prose-pre:bg-[#0f172a] prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:font-mono prose-pre:text-sm"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          placeholder="<p>Escreva o HTML do artigo aqui...</p>"
          className="block w-full min-h-[360px] p-4 font-mono text-sm text-[#1a1a1a] bg-[#faf9f8] focus:outline-none resize-y"
        />
      )}
    </div>
  );
}
