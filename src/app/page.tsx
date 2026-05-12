import Header from './components/Header';
import Hero from './components/Hero';
import PricingBand from './components/PricingBand';
import StatsBanner from './components/StatsBanner';
import Process from './components/Process';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <PricingBand />
      <StatsBanner />
      <Process />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
