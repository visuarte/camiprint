# Design Document

## Overview

This design document outlines the technical architecture for transforming the Camiprint landing page from a basic presentation into a professional, conversion-optimized ecommerce landing page. The solution will be built using Next.js 16.2.6, React 19, and Tailwind CSS 4, leveraging modern web development practices including server components, responsive design, and accessibility standards.

### Goals

- Create a professional, conversion-optimized landing page for Camiprint
- Implement a component-based architecture for maintainability and reusability
- Ensure responsive design across all device sizes (mobile, tablet, desktop)
- Optimize for accessibility (WCAG 2.1 AA compliance)
- Maximize conversion rates through strategic placement of CTAs and trust signals
- Provide smooth animations and transitions for enhanced user experience

### Non-Goals

- Backend API implementation for form submission (will use client-side validation only)
- User authentication or account management
- Shopping cart or checkout functionality
- Content management system (CMS) integration
- Multi-language support (Spanish only)

## Architecture

### High-Level Architecture

The landing page will be implemented as a single-page application using Next.js App Router with the following structure:

```
src/app/
├── page.tsx                 # Main landing page (Server Component)
├── layout.tsx              # Root layout with metadata
├── globals.css             # Global styles and Tailwind directives
└── components/
    ├── Navigation.tsx      # Navigation bar with mobile menu
    ├── Hero.tsx           # Hero section with CTAs
    ├── Pricing.tsx        # Pricing tiers section
    ├── Process.tsx        # Purchase process steps
    ├── Testimonials.tsx   # Customer testimonials
    ├── FAQ.tsx            # Accordion-style FAQ
    ├── ContactForm.tsx    # Quote request form (Client Component)
    └── Footer.tsx         # Footer with links and contact info
```

### Component Strategy

**Server Components (Default):**
- Navigation, Hero, Pricing, Process, Testimonials, Footer
- These components render static content and don't require client-side interactivity beyond CSS hover states

**Client Components:**
- ContactForm: Requires form state management and validation
- FAQ: Requires accordion expand/collapse state
- Navigation (mobile menu): Requires menu toggle state

### Rendering Strategy

- **Static Generation (SSG)**: The entire landing page will be statically generated at build time for optimal performance
- **No ISR or SSR needed**: Content is static and doesn't require dynamic data fetching

## Components and Interfaces

### 1. Navigation Component

**Purpose:** Provides site navigation with fixed positioning and mobile-responsive menu.

**Props Interface:**
```typescript
interface NavigationProps {
  // No props needed - navigation items are static
}
```

**State (Client Component portion):**
```typescript
interface NavigationState {
  isMobileMenuOpen: boolean;
}
```

**Key Features:**
- Fixed positioning with backdrop blur
- Smooth scroll to sections using anchor links
- Hamburger menu for mobile (<768px)
- Primary CTA button "Solicitar Cotización"

**Implementation Notes:**
- Use `position: fixed` with `backdrop-blur` for glassmorphism effect
- Implement smooth scroll using CSS `scroll-behavior: smooth` on html element
- Mobile menu slides in from right with transform animation
- Use `useEffect` to close mobile menu on route change or outside click

---

### 2. Hero Component

**Purpose:** Primary conversion section with value proposition and dual CTAs.

**Props Interface:**
```typescript
interface HeroProps {
  // No props needed - content is static
}
```

**Key Features:**
- Gradient background (slate-900 to blue-800)
- Main heading with value proposition
- Descriptive subheading
- Two CTA buttons (primary: "Ver Ofertas", secondary: "Solicitar Cotización")
- Trust indicators (delivery time, minimum order, free design)

**Implementation Notes:**
- Use Tailwind gradient utilities for background
- CTAs link to section IDs using anchor tags (#ofertas, #contacto)
- Trust indicators displayed as inline badges or icon + text combinations
- Responsive text sizing (text-3xl on mobile, text-5xl on desktop)

---

### 3. Pricing Component

**Purpose:** Displays pricing tiers with volume discounts.

**Props Interface:**
```typescript
interface PricingTier {
  id: string;
  quantity: string;          // e.g., "10+ camisetas"
  pricePerUnit: string;      // e.g., "12,90 € / unidad"
  savings: string;           // e.g., "Ahorra 8%"
  isPopular?: boolean;       // Highlight flag
}

interface PricingProps {
  tiers: PricingTier[];
}
```

**Key Features:**
- Responsive grid (1 column mobile, 3 columns desktop)
- Visual highlight for most popular tier
- CTA button per tier linking to contact form with pre-selected quantity
- Disclaimer about pricing being estimates

**Implementation Notes:**
- Use CSS Grid with `grid-cols-1 md:grid-cols-3`
- Popular tier gets border accent and "Más Popular" badge
- CTA buttons link to `#contacto?quantity={tier.id}`
- Card design with subtle shadows and hover effects

---

### 4. Process Component

**Purpose:** Explains the purchase process in clear steps.

**Props Interface:**
```typescript
interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;              // Icon identifier or emoji
  timeframe?: string;        // e.g., "24 horas"
}

interface ProcessProps {
  steps: ProcessStep[];
}
```

**Key Features:**
- 4 steps: Solicitar Cotización → Recibir Propuesta → Aprobar Diseño → Recibir Pedido
- Visual step indicators with icons
- Horizontal layout on desktop, vertical on mobile
- Timeframe for each step
- Final CTA "Comenzar Ahora"

**Implementation Notes:**
- Use flexbox for horizontal/vertical layout switching
- Step connectors (lines between steps) on desktop only
- Icons can be emojis or SVG icons
- Responsive: `flex-col md:flex-row`

---

### 5. Testimonials Component

**Purpose:** Displays social proof through customer testimonials.

**Props Interface:**
```typescript
interface Testimonial {
  id: string;
  customerName: string;
  companyName: string;
  testimonialText: string;
  rating: number;            // 1-5
  avatarUrl?: string;        // Optional customer/company logo
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}
```

**Key Features:**
- Minimum 3 testimonials
- Star rating display (1-5 stars)
- Customer name and company
- Optional avatar/logo
- Responsive grid (1 column mobile, 3 columns desktop)

**Implementation Notes:**
- Card-based design with shadows
- Star rating rendered as SVG or Unicode stars (★)
- Truncate long testimonials with "..." if needed
- Use CSS Grid: `grid-cols-1 md:grid-cols-3`

---

### 6. FAQ Component

**Purpose:** Accordion-style FAQ section to address common questions.

**Props Interface:**
```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}
```

**State (Client Component):**
```typescript
interface FAQState {
  expandedId: string | null;  // Only one expanded at a time
}
```

**Key Features:**
- Minimum 6 FAQ items
- Accordion interaction (click to expand/collapse)
- Only one answer visible at a time
- Chevron icons indicating expand/collapse state
- Final CTA "¿Más preguntas? Contáctanos"

**Implementation Notes:**
- Use `useState` to track expanded item
- Animate height with CSS transitions or Tailwind's transition utilities
- Chevron rotates 180deg when expanded
- Questions cover: minimum order, delivery time, design process, payment, customization, returns

---

### 7. ContactForm Component

**Purpose:** Lead capture form for quote requests.

**Props Interface:**
```typescript
interface ContactFormProps {
  preSelectedQuantity?: string;  // From URL params or pricing tier click
}
```

**State (Client Component):**
```typescript
interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  quantity: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ContactFormState {
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
}
```

**Validation Rules:**
```typescript
interface ValidationRules {
  name: { required: true, minLength: 2 };
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
  phone: { required: true, pattern: /^[0-9\s\+\-\(\)]+$/ };
  companyName: { required: true };
  quantity: { required: true };
  message: { required: false };
}
```

**Key Features:**
- 6 fields (5 required, 1 optional)
- Client-side validation
- Quantity selector with predefined ranges
- Success message after submission
- Form reset after successful submission
- Privacy notice
- Visual indicators for required fields (asterisk)

**Implementation Notes:**
- Use `useState` for form data and errors
- Validate on blur and on submit
- Display inline error messages below fields
- Success state shows confirmation message and hides form temporarily
- For MVP, form submission can log to console or use a mock API
- Use Tailwind form utilities for styling

---

### 8. Footer Component

**Purpose:** Provides additional information, links, and contact details.

**Props Interface:**
```typescript
interface FooterProps {
  // No props needed - content is static
}
```

**Key Features:**
- Company logo
- Contact information (email, phone, address)
- Quick links (Privacy Policy, Terms, Shipping Policy)
- Social media icons with links
- Copyright with current year
- Company description
- 4-column layout on desktop, stacked on mobile

**Implementation Notes:**
- Use CSS Grid for column layout: `grid-cols-1 md:grid-cols-4`
- Social icons can be SVG or icon font
- Dark background (slate-900 or similar)
- Links styled with hover effects
- Use `new Date().getFullYear()` for dynamic copyright year

---

## Data Models

### Static Data Structures

Since this is a static landing page, all data will be defined as constants within components or in a separate data file.

**Pricing Data:**
```typescript
const pricingTiers: PricingTier[] = [
  {
    id: "tier-10",
    quantity: "10-24 camisetas",
    pricePerUnit: "12,90 €",
    savings: "Ahorra 8%",
    isPopular: false
  },
  {
    id: "tier-25",
    quantity: "25-49 camisetas",
    pricePerUnit: "10,90 €",
    savings: "Ahorra 18%",
    isPopular: true
  },
  {
    id: "tier-50",
    quantity: "50+ camisetas",
    pricePerUnit: "8,90 €",
    savings: "Ahorra 30%",
    isPopular: false
  }
];
```

**Process Steps Data:**
```typescript
const processSteps: ProcessStep[] = [
  {
    stepNumber: 1,
    title: "Solicitar Cotización",
    description: "Completa el formulario con los detalles de tu pedido",
    icon: "📝",
    timeframe: "2 minutos"
  },
  {
    stepNumber: 2,
    title: "Recibir Propuesta",
    description: "Te enviamos una cotización personalizada",
    icon: "📧",
    timeframe: "24 horas"
  },
  {
    stepNumber: 3,
    title: "Aprobar Diseño",
    description: "Revisas y apruebas el diseño de tus camisetas",
    icon: "✅",
    timeframe: "2-3 días"
  },
  {
    stepNumber: 4,
    title: "Recibir Pedido",
    description: "Producimos y enviamos tu pedido",
    icon: "📦",
    timeframe: "7-10 días"
  }
];
```

**Testimonials Data:**
```typescript
const testimonials: Testimonial[] = [
  {
    id: "test-1",
    customerName: "María González",
    companyName: "Restaurante El Buen Sabor",
    testimonialText: "Excelente calidad y servicio rápido. Nuestro equipo luce profesional con las camisetas personalizadas.",
    rating: 5
  },
  {
    id: "test-2",
    customerName: "Carlos Ruiz",
    companyName: "Hotel Costa Azul",
    testimonialText: "Muy satisfechos con el resultado. El proceso fue sencillo y el diseño quedó perfecto.",
    rating: 5
  },
  {
    id: "test-3",
    customerName: "Ana Martínez",
    companyName: "Cafetería Urban Coffee",
    testimonialText: "Recomendado 100%. Buena relación calidad-precio y atención personalizada.",
    rating: 5
  }
];
```

**FAQ Data:**
```typescript
const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    question: "¿Cuál es el pedido mínimo?",
    answer: "El pedido mínimo es de 10 camisetas. Ofrecemos mejores precios por volumen a partir de 25 y 50 unidades."
  },
  {
    id: "faq-2",
    question: "¿Cuánto tiempo tarda la entrega?",
    answer: "El tiempo de entrega es de 7-10 días hábiles desde la aprobación del diseño. Para pedidos urgentes, consulta disponibilidad de servicio express."
  },
  {
    id: "faq-3",
    question: "¿Cómo funciona el proceso de diseño?",
    answer: "Puedes enviarnos tu logo o idea, y nuestro equipo creará un diseño sin costo adicional. Te enviamos una prueba digital para tu aprobación antes de producir."
  },
  {
    id: "faq-4",
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos transferencia bancaria, tarjeta de crédito/débito y PayPal. Para empresas, ofrecemos pago contra factura con condiciones especiales."
  },
  {
    id: "faq-5",
    question: "¿Puedo personalizar el tipo de camiseta?",
    answer: "Sí, ofrecemos diferentes tipos de camisetas (cuello redondo, polo, manga larga) y colores. Consulta opciones disponibles al solicitar tu cotización."
  },
  {
    id: "faq-6",
    question: "¿Tienen política de devoluciones?",
    answer: "Garantizamos la calidad de nuestros productos. Si hay algún defecto de fabricación, realizamos reposición sin costo. No aceptamos devoluciones por cambio de opinión en pedidos personalizados."
  }
];
```

---

## Testing Strategy

### Testing Approach

This landing page is primarily a UI/presentation feature with limited business logic. The testing strategy will focus on:

1. **Component Unit Tests**: Verify component rendering and basic interactions
2. **Integration Tests**: Verify form validation and user flows
3. **Visual Regression Tests**: Ensure responsive design works across breakpoints
4. **Accessibility Tests**: Verify WCAG compliance

### Unit Testing

**Tools**: Vitest + React Testing Library

**Test Coverage:**

- **Navigation Component**:
  - Renders all navigation links
  - Mobile menu toggles correctly
  - Smooth scroll links work
  
- **Hero Component**:
  - Renders heading and CTAs
  - Trust indicators display correctly
  
- **Pricing Component**:
  - Renders all pricing tiers
  - Highlights popular tier
  - CTA links include correct quantity parameter
  
- **Process Component**:
  - Renders all 4 steps in order
  - Displays timeframes
  
- **Testimonials Component**:
  - Renders all testimonials
  - Star ratings display correctly
  
- **FAQ Component**:
  - Renders all questions
  - Expands/collapses on click
  - Only one item expanded at a time
  
- **ContactForm Component**:
  - Validates required fields
  - Validates email format
  - Validates phone format
  - Shows error messages
  - Shows success message after submission
  - Resets form after successful submission
  - Pre-selects quantity from URL parameter
  
- **Footer Component**:
  - Renders all sections
  - Displays current year in copyright

### Integration Testing

**User Flows to Test:**

1. **Quote Request Flow**:
   - User clicks pricing tier CTA
   - Form scrolls into view with pre-selected quantity
   - User fills form
   - Validation passes
   - Success message displays

2. **Navigation Flow**:
   - User clicks navigation link
   - Page scrolls to correct section
   - Mobile menu closes after selection

3. **FAQ Interaction**:
   - User clicks question
   - Answer expands
   - Previous answer collapses

### Responsive Design Testing

**Breakpoints to Test:**
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

**Test Cases:**
- All sections stack correctly on mobile
- Navigation switches to hamburger menu below 768px
- Grid layouts adjust (1 column → 3 columns)
- Text sizes scale appropriately
- Touch targets meet 44x44px minimum on mobile
- No horizontal scrolling at any breakpoint

### Accessibility Testing

**Manual Testing:**
- Keyboard navigation through all interactive elements
- Screen reader compatibility (NVDA/JAWS)
- Color contrast verification (WebAIM Contrast Checker)
- Focus indicators visible

**Automated Testing:**
- Use `@axe-core/react` or `jest-axe` for automated a11y tests
- Verify semantic HTML structure
- Check ARIA labels on icon buttons
- Verify heading hierarchy

### Performance Testing

**Metrics to Monitor:**
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Total Blocking Time (TBT) < 200ms
- Cumulative Layout Shift (CLS) < 0.1

**Tools:**
- Lighthouse CI in build pipeline
- WebPageTest for real-world performance

---

## Error Handling

### Form Validation Errors

**Client-Side Validation:**

```typescript
const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  }
  
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Por favor, introduce un email válido";
  }
  
  if (!formData.phone || !/^[0-9\s\+\-\(\)]+$/.test(formData.phone)) {
    errors.phone = "Por favor, introduce un teléfono válido";
  }
  
  if (!formData.companyName || formData.companyName.trim().length === 0) {
    errors.companyName = "El nombre de la empresa es obligatorio";
  }
  
  if (!formData.quantity) {
    errors.quantity = "Por favor, selecciona una cantidad";
  }
  
  return errors;
};
```

**Error Display:**
- Inline error messages below each field
- Red border on invalid fields
- Error icon next to field label
- Errors clear when user starts typing

### Navigation Errors

**Smooth Scroll Fallback:**
If smooth scroll is not supported, fall back to instant scroll:

```typescript
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    try {
      element.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      // Fallback for browsers that don't support smooth scroll
      element.scrollIntoView();
    }
  }
};
```

### Animation Errors

**Respect User Preferences:**
Disable animations for users with `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Image Loading Errors

**Fallback for Missing Images:**
- Use Next.js Image component with placeholder
- Provide alt text for all images
- Use background colors as fallback for avatars

---

## Implementation Plan

### Phase 1: Foundation (Priority: High)

**Tasks:**
1. Set up component structure and file organization
2. Implement Navigation component with mobile menu
3. Implement Hero component with CTAs
4. Implement Footer component
5. Set up global styles and Tailwind configuration
6. Implement smooth scroll behavior

**Deliverables:**
- Basic page structure with navigation and hero
- Mobile-responsive navigation
- Footer with all sections

### Phase 2: Content Sections (Priority: High)

**Tasks:**
1. Implement Pricing component with tier cards
2. Implement Process component with steps
3. Implement Testimonials component with cards
4. Implement FAQ component with accordion
5. Create static data files for all sections

**Deliverables:**
- All content sections rendered
- Responsive layouts for all sections
- FAQ accordion functionality

### Phase 3: Form and Interactivity (Priority: High)

**Tasks:**
1. Implement ContactForm component
2. Add form validation logic
3. Implement success/error states
4. Add URL parameter handling for pre-selected quantity
5. Connect pricing tier CTAs to form

**Deliverables:**
- Fully functional contact form
- Client-side validation
- Success message display

### Phase 4: Polish and Optimization (Priority: Medium)

**Tasks:**
1. Add animations and transitions
2. Implement scroll-triggered fade-in effects
3. Add hover states and micro-interactions
4. Optimize images and assets
5. Add loading states where needed

**Deliverables:**
- Smooth animations throughout
- Enhanced user experience
- Optimized performance

### Phase 5: Accessibility and Testing (Priority: High)

**Tasks:**
1. Add ARIA labels and semantic HTML
2. Implement keyboard navigation
3. Add skip-to-content link
4. Test with screen readers
5. Verify color contrast
6. Write unit tests for all components
7. Write integration tests for user flows

**Deliverables:**
- WCAG 2.1 AA compliant
- Full test coverage
- Accessibility audit passed

### Phase 6: Final Review and Launch (Priority: High)

**Tasks:**
1. Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. Device testing (iOS, Android)
3. Performance audit with Lighthouse
4. Final content review
5. Deploy to production

**Deliverables:**
- Production-ready landing page
- Performance score > 90
- All browsers supported

---

## Technical Considerations

### Next.js 16.2.6 Specific Considerations

Based on the workspace rules, Next.js 16 may have breaking changes. Key considerations:

1. **App Router**: Use App Router (not Pages Router)
2. **Server Components**: Default to Server Components, use 'use client' only when needed
3. **Metadata API**: Use Next.js metadata API for SEO
4. **Image Optimization**: Use next/image for all images
5. **Font Optimization**: Use next/font for web fonts

### Tailwind CSS 4 Considerations

Tailwind CSS 4 may have new features or breaking changes:

1. **Configuration**: Check for new config format
2. **Utilities**: Verify all utility classes are compatible
3. **Plugins**: Ensure form plugin compatibility if needed
4. **JIT Mode**: Leverage JIT mode for custom values

### React 19 Considerations

React 19 may include new features:

1. **Concurrent Features**: Leverage concurrent rendering if applicable
2. **Transitions**: Use useTransition for non-urgent updates
3. **Suspense**: Consider Suspense boundaries for loading states

### Performance Optimizations

1. **Code Splitting**: Automatic with Next.js App Router
2. **Image Optimization**: Use next/image with proper sizing
3. **Font Loading**: Use next/font to prevent layout shift
4. **CSS**: Tailwind purges unused CSS automatically
5. **Bundle Size**: Monitor with Next.js built-in analyzer

### SEO Considerations

```typescript
// app/layout.tsx or app/page.tsx
export const metadata = {
  title: 'Camiprint - Camisetas Personalizadas para Empresas',
  description: 'Camisetas personalizadas para negocios, restaurantes y empresas. Diseño gratuito, entrega en 7-10 días. Desde 50 unidades.',
  keywords: 'camisetas personalizadas, ropa laboral, uniformes empresa, camisetas promocionales',
  openGraph: {
    title: 'Camiprint - Camisetas Personalizadas para Empresas',
    description: 'Camisetas personalizadas para negocios, restaurantes y empresas.',
    type: 'website',
  },
};
```

### Browser Support

**Target Browsers:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Polyfills:**
- Not needed for modern browsers
- Consider fallbacks for older browsers if analytics show significant traffic

---

## Deployment Considerations

### Build Process

```bash
npm run build
npm run start
```

### Environment Variables

No environment variables needed for MVP (static content only).

For future API integration:
```
NEXT_PUBLIC_API_URL=https://api.camiprint.com
NEXT_PUBLIC_FORM_ENDPOINT=/api/quotes
```

### Hosting Recommendations

**Recommended Platform:** Vercel (optimized for Next.js)

**Alternative Platforms:**
- Netlify
- AWS Amplify
- Cloudflare Pages

### Performance Monitoring

**Tools to Integrate:**
- Vercel Analytics (built-in)
- Google Analytics 4
- Hotjar or similar for heatmaps

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Backend Integration**:
   - API endpoint for form submission
   - Email notifications
   - CRM integration

2. **Advanced Features**:
   - Live chat widget
   - Product catalog with filtering
   - Design upload tool
   - Real-time price calculator

3. **Marketing Features**:
   - A/B testing framework
   - Exit-intent popups
   - Email capture modal
   - Referral program

4. **Analytics**:
   - Conversion tracking
   - Heatmap analysis
   - User session recording
   - Funnel analysis

---

## Conclusion

This design provides a comprehensive blueprint for building a professional, conversion-optimized landing page for Camiprint. The component-based architecture ensures maintainability, while the focus on responsive design, accessibility, and performance guarantees a high-quality user experience across all devices.

The implementation plan is structured in phases to deliver value incrementally, with the highest priority features (navigation, hero, pricing, form) delivered first. The testing strategy ensures quality and reliability, while the technical considerations address modern web development best practices.

By following this design, the development team will create a landing page that not only meets all functional requirements but also provides an excellent foundation for future enhancements and scaling.
