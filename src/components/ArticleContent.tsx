import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, Terminal } from 'lucide-react';

interface ArticleContentProps {
  content: string;
  className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  terraform: 'Terraform (HCL)',
  hcl: 'Terraform (HCL)',
  bicep: 'Azure Bicep',
  bash: 'Bash / Azure CLI',
  sh: 'Bash / Shell',
  shell: 'Bash / Shell',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  python: 'Python',
  py: 'Python',
  csharp: 'C#',
  cs: 'C#',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  xml: 'XML',
  text: 'Código',
};

function getLanguageLabel(raw?: string | null): string {
  if (!raw) return 'Código';
  const cleaned = raw.replace(/^language-/i, '').trim().toLowerCase();
  return LANGUAGE_LABELS[cleaned] || cleaned.toUpperCase() || 'Código';
}

function CodeBlockCard({ code, language }: { code: string; language?: string | null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy via temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="not-prose my-7 rounded-xl overflow-hidden border border-[#2d3343] bg-[#0f172a] shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-[#334155]">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 tracking-wide">
          <Terminal className="h-4 w-4 text-sky-400" />
          <span>{getLanguageLabel(language)}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-700/80 text-slate-100 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-sm sm:text-[15px] leading-relaxed font-mono text-slate-100 m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
}

type ContentSegment =
  | { type: 'html'; html: string }
  | { type: 'code'; code: string; language: string | null };

function splitHtmlWithCodeBlocks(html: string): ContentSegment[] {
  if (typeof window === 'undefined' || !html) {
    return [{ type: 'html', html }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return [{ type: 'html', html }];

  const segments: ContentSegment[] = [];
  let htmlBuffer = '';

  const flushBuffer = () => {
    if (htmlBuffer.trim()) {
      segments.push({ type: 'html', html: htmlBuffer });
      htmlBuffer = '';
    }
  };

  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const isDirectPre = el.tagName === 'PRE';
      const isCodeWrapper = el.classList.contains('blog-code-block') && el.querySelector('pre');

      if (isDirectPre || isCodeWrapper) {
        flushBuffer();
        const preEl = isDirectPre ? el : (el.querySelector('pre') as HTMLElement);
        const codeEl = preEl.querySelector('code');
        const langAttr =
          el.getAttribute('data-lang') ||
          preEl.getAttribute('data-lang') ||
          codeEl?.getAttribute('data-lang') ||
          (codeEl?.className.match(/language-([a-z0-9_-]+)/i)?.[1] ?? null);
        const codeText = (codeEl ? codeEl.textContent : preEl.textContent) ?? '';
        segments.push({
          type: 'code',
          code: codeText.replace(/^\n+|\n+$/g, ''),
          language: langAttr,
        });
        return;
      }

      htmlBuffer += el.outerHTML;
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      htmlBuffer += node.textContent;
    }
  });

  flushBuffer();
  return segments;
}

export default function ArticleContent({ content, className = '' }: ArticleContentProps) {
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(content);

  const segments = useMemo(() => {
    if (!isHtmlContent) return [];
    return splitHtmlWithCodeBlocks(content);
  }, [content, isHtmlContent]);

  if (!content?.trim()) {
    return null;
  }

  if (!isHtmlContent) {
    return (
      <div
        className={`prose prose-lg md:prose-xl prose-zinc prose-a:text-[#0067b8] hover:prose-a:text-[#005a9e] prose-headings:font-bold prose-headings:text-[#1a1a1a] prose-strong:font-bold prose-p:text-[#242424] prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-sm max-w-none ${className}`}
      >
        <ReactMarkdown
          components={{
            pre({ children }) {
              return <>{children}</>;
            },
            code({ className: codeClass, children }) {
              const match = /language-(\w+)/.exec(codeClass || '');
              const text = String(children).replace(/\n$/, '');
              if (match || text.includes('\n')) {
                return <CodeBlockCard code={text} language={match?.[1] || null} />;
              }
              return (
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono font-semibold text-[#0067b8]">
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className={`prose prose-lg md:prose-xl prose-zinc prose-a:text-[#0067b8] hover:prose-a:text-[#005a9e] prose-headings:font-bold prose-headings:text-[#1a1a1a] prose-strong:font-bold prose-p:text-[#242424] prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-sm prose-img:my-6 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:font-medium prose-figcaption:text-[#505050] max-w-none ${className}`}
    >
      {segments.map((seg, idx) =>
        seg.type === 'code' ? (
          <CodeBlockCard key={idx} code={seg.code} language={seg.language} />
        ) : (
          <div key={idx} dangerouslySetInnerHTML={{ __html: seg.html }} />
        )
      )}
    </div>
  );
}
