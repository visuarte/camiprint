import Link from 'next/link';
import { processSteps } from '../data/processSteps';

const Process = () => {
  return (
    <section id="proceso" data-reveal data-reveal-delay="70" className="scroll-mt-20 bg-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Tu pedido en 4 pasos
          </h2>
          <p className="mx-auto max-w-2xl text-base text-cami-300 md:text-lg">
            Un proceso simple, transparente y rápido para que tengas tus camisetas listas cuanto antes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {processSteps.map((step, index) => (
            <article
              key={step.stepNumber}
              className="relative rounded-2xl border border-white/12 bg-gradient-to-b from-cami-900 to-cami-800 p-6 shadow-glow backdrop-blur-sm"
            >
              {index < processSteps.length - 1 && (
                <div className="absolute top-1/2 -right-3 hidden h-0.5 w-6 bg-blue-300 lg:block" aria-hidden="true" />
              )}

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-cami-100">
                <span>Paso {step.stepNumber}</span>
                <span className="text-xs text-cami-300">• {step.timeframe}</span>
              </div>

              <div className="mb-3 text-3xl" role="img" aria-label={step.title}>
                {step.icon}
              </div>

              <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-cami-300 md:text-base">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:mt-16">
          <Link
            href="#contacto"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-metal-button px-8 py-3 text-base font-semibold text-cami-100 shadow-metal transition-all hover:scale-105 hover:brightness-110"
          >
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Process;
