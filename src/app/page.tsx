import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import Process from './components/Process';

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <Pricing />
      <Process />
      <section id="testimonios" className="scroll-mt-20 bg-gray-50 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Testimonios</h2>
        </div>
      </section>
      <section id="faq" className="scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">FAQ</h2>
        </div>
      </section>
      <section id="contacto" className="scroll-mt-20 bg-slate-900 px-4 py-16 text-white md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold md:text-4xl">Contacto</h2>
        </div>
      </section>
    </>
  );
}
