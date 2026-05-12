'use client';

import { useState } from 'react';
import { faqItems } from '../data/faqs';

const FAQSection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(faqItems[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section id="faq" className="scroll-mt-20 bg-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Preguntas frecuentes</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-cami-300 md:text-lg">
            Respuestas rapidas para que tomes decision sin friccion.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-white/12 bg-gradient-to-b from-cami-800 to-cami-900 shadow-glow">
                <button
                  id={`${item.id}-trigger`}
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`${item.id}-panel`}
                >
                  <span className="pr-4 text-base font-semibold text-white md:text-lg">{item.question}</span>
                  <span
                    className={`text-cami-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                    aria-hidden="true"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={`${item.id}-trigger`}
                  className="grid overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr', opacity: isExpanded ? 1 : 0 }}
                >
                  <div className="min-h-0">
                    <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-cami-200 md:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-cami-100 shadow-glow transition-all hover:brightness-110"
          >
            Mas preguntas? Contactanos
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
