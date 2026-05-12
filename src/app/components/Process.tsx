import Link from 'next/link';
import { processSteps } from '../data/processSteps';

const Process = () => {
  return (
    <section id="proceso" className="scroll-mt-20 bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Tu pedido en 4 pasos
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Un proceso simple, transparente y rápido para que tengas tus camisetas listas cuanto antes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {processSteps.map((step, index) => (
            <article key={step.stepNumber} className="relative rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              {index < processSteps.length - 1 && (
                <div className="absolute top-1/2 -right-3 hidden h-0.5 w-6 bg-blue-300 lg:block" aria-hidden="true" />
              )}

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                <span>Paso {step.stepNumber}</span>
                <span className="text-xs text-blue-600">• {step.timeframe}</span>
              </div>

              <div className="mb-3 text-3xl" role="img" aria-label={step.title}>
                {step.icon}
              </div>

              <h3 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center md:mt-16">
          <Link
            href="#contacto"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
          >
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Process;
