import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { CustomPageSection } from '../types';
import { PAGE_ICON_MAP } from '../utils/pageDefaults';
import ArticleContent from './ArticleContent';

interface PageSectionsRendererProps {
  sections?: CustomPageSection[];
}

export default function PageSectionsRenderer({ sections }: PageSectionsRendererProps) {
  if (!sections || sections.length === 0) return null;

  const isExternal = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

  return (
    <div className="space-y-16">
      {sections.map((section) => {
        if (section.type === 'text') {
          return (
            <section key={section.id} className="max-w-4xl mx-auto">
              {(section.title || section.subtitle) && (
                <div className="text-center mb-8">
                  {section.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className="mt-3 text-lg font-medium text-[#505050] leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm">
                {section.content?.trim() ? (
                  <ArticleContent content={section.content} />
                ) : (
                  <p className="text-gray-400 italic">Seção de texto vazia.</p>
                )}
              </div>
            </section>
          );
        }

        if (section.type === 'cards') {
          const cards = section.cards || [];
          return (
            <section key={section.id}>
              {(section.title || section.subtitle) && (
                <div className="max-w-2xl mx-auto text-center mb-10">
                  {section.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className="mt-3 text-lg font-medium text-[#505050] leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}
              <div
                className={`grid grid-cols-1 gap-6 ${
                  cards.length === 1
                    ? 'max-w-xl mx-auto'
                    : cards.length === 2
                      ? 'md:grid-cols-2'
                      : 'md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {cards.map((card, idx) => {
                  const Icon = PAGE_ICON_MAP[card.icon] || PAGE_ICON_MAP.cloud;
                  const inner = (
                    <div className="h-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col">
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="h-6 w-6 text-[#0067b8]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{card.title}</h3>
                      <p className="text-base font-medium text-[#4a4a4a] leading-relaxed flex-1">
                        {card.description}
                      </p>
                      {card.link?.trim() && (
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0067b8]">
                          Acessar <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  );

                  if (card.link?.trim()) {
                    return isExternal(card.link) ? (
                      <a
                        key={idx}
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link key={idx} to={card.link} className="block h-full">
                        {inner}
                      </Link>
                    );
                  }

                  return <div key={idx}>{inner}</div>;
                })}
              </div>
            </section>
          );
        }

        if (section.type === 'gallery') {
          const items = section.gallery || [];
          return (
            <section key={section.id}>
              {(section.title || section.subtitle) && (
                <div className="max-w-2xl mx-auto text-center mb-10">
                  {section.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className="mt-3 text-lg font-medium text-[#505050] leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-28 h-28 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Award className="h-10 w-10 text-[#0067b8]" />
                      </div>
                    )}
                    {item.name && (
                      <span className="font-bold text-[#1a1a1a] text-base leading-tight">
                        {item.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === 'cta') {
          const link = section.buttonLink?.trim() || '/articles';
          return (
            <section
              key={section.id}
              className="rounded-2xl bg-[#010510] text-white p-10 sm:p-14 text-center shadow-lg border border-blue-900/40"
            >
              {section.title && (
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  {section.title}
                </h2>
              )}
              {section.subtitle && (
                <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed">
                  {section.subtitle}
                </p>
              )}
              {section.buttonText?.trim() &&
                (isExternal(link) ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0067b8] px-8 py-4 text-base sm:text-lg font-bold text-white hover:bg-[#005a9e] transition-colors shadow-md"
                  >
                    {section.buttonText}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                ) : (
                  <Link
                    to={link}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0067b8] px-8 py-4 text-base sm:text-lg font-bold text-white hover:bg-[#005a9e] transition-colors shadow-md"
                  >
                    {section.buttonText}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ))}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
