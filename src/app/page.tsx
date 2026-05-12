import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import Process from './components/Process';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ViewportAnimator from './components/ViewportAnimator';

export default function Home() {
  return (
    <>
      <ViewportAnimator />
      <Navigation />
      <Hero />
      <Pricing />
      <Process />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </>
  );
}
