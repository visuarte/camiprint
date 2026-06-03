# Implementation Plan: Ecommerce Landing Page

## Overview

Este plan de implementaciÃ³n transforma la landing page bÃ¡sica de CAMIART en una plataforma de ecommerce profesional y optimizada para conversiÃ³n. La implementaciÃ³n utiliza Next.js 16.2.6, React 19, TypeScript y Tailwind CSS 4, siguiendo una arquitectura basada en componentes con Server Components por defecto y Client Components solo cuando sea necesario para interactividad.

El plan estÃ¡ organizado en 6 fases que cubren desde la configuraciÃ³n inicial hasta el despliegue final, con Ã©nfasis en responsive design, accesibilidad WCAG 2.1 AA, y optimizaciÃ³n de conversiÃ³n.

## Tasks

- [x] 1. ConfiguraciÃ³n inicial y estructura del proyecto
  - Verificar versiones de Next.js 16.2.6, React 19 y Tailwind CSS 4
  - Leer la documentaciÃ³n de Next.js 16 en `node_modules/next/dist/docs/` para identificar breaking changes
  - Crear estructura de directorios para componentes: `src/app/components/`
  - Configurar Tailwind CSS 4 con las utilidades necesarias (forms, typography si es necesario)
  - Configurar archivo `globals.css` con directivas de Tailwind y estilos base
  - AÃ±adir `scroll-behavior: smooth` al elemento html para navegaciÃ³n suave
  - Configurar metadata SEO en `layout.tsx` (tÃ­tulo, descripciÃ³n, keywords, Open Graph)
  - _Requirements: 11.1, 11.2_

- [x] 2. Implementar Navigation Component
  - [x] 2.1 Crear componente Navigation con parte Server y Client
    - Crear `src/app/components/Navigation.tsx` como Client Component ('use client')
    - Implementar estructura HTML semÃ¡ntica con `<nav>` y `<header>`
    - AÃ±adir logo de CAMIART en el lado izquierdo
    - Implementar enlaces de navegaciÃ³n a secciones (Inicio, Ofertas, Proceso, Testimonios, FAQ, Contacto)
    - AÃ±adir botÃ³n CTA principal "Solicitar CotizaciÃ³n" que enlaza a #contacto
    - Implementar posicionamiento fijo con `position: fixed` y `backdrop-blur`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8_
  
  - [x] 2.2 Implementar menÃº mÃ³vil responsive
    - AÃ±adir estado `isMobileMenuOpen` con useState
    - Implementar icono hamburguesa visible solo en viewport < 768px
    - Crear menÃº mÃ³vil que se desliza desde la derecha con animaciÃ³n transform
    - Implementar toggle del menÃº al hacer clic en el icono hamburguesa
    - AÃ±adir funcionalidad para cerrar menÃº al hacer clic fuera o en un enlace
    - Asegurar que todos los enlaces de navegaciÃ³n funcionen con smooth scroll
    - _Requirements: 1.5, 1.6, 1.7, 9.2, 9.6_
  
  - [x] 2.3 Escribir tests unitarios para Navigation
    - Test: renderiza todos los enlaces de navegaciÃ³n
    - Test: menÃº mÃ³vil se abre y cierra correctamente
    - Test: botÃ³n CTA estÃ¡ presente y enlaza a #contacto
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implementar Hero Section
  - [x] 3.1 Crear componente Hero
    - Crear `src/app/components/Hero.tsx` como Server Component
    - Implementar estructura HTML semÃ¡ntica con `<section>` y heading `<h1>`
    - AÃ±adir tÃ­tulo principal con la propuesta de valor de CAMIART
    - AÃ±adir subtÃ­tulo descriptivo explicando el servicio
    - Implementar fondo con gradiente (slate-900 a blue-800) usando utilidades de Tailwind
    - Asegurar texto responsive (text-3xl en mÃ³vil, text-5xl en desktop)
    - _Requirements: 2.1, 2.2, 2.8, 9.5_
  
  - [x] 3.2 AÃ±adir CTAs y trust indicators
    - Implementar botÃ³n CTA primario "Ver Ofertas" que enlaza a #ofertas
    - Implementar botÃ³n CTA secundario "Solicitar CotizaciÃ³n" que enlaza a #contacto
    - AÃ±adir trust indicators: "Entrega en 7-10 dÃ­as", "Desde 50 unidades", "DiseÃ±o gratuito"
    - Estilizar trust indicators como badges o icon + text
    - Asegurar contraste de color adecuado (ratio 4.5:1) para accesibilidad
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 10.1, 10.2, 11.4_
  
  - [x] 3.3 Escribir tests unitarios para Hero
    - Test: renderiza heading y subheading correctamente
    - Test: ambos CTAs estÃ¡n presentes con texto correcto
    - Test: trust indicators se muestran correctamente
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implementar Pricing Section
  - [x] 4.1 Crear datos y componente Pricing
    - Crear archivo de datos con los 3 pricing tiers (10+, 25+, 50+ unidades)
    - Definir interface `PricingTier` con id, quantity, pricePerUnit, savings, isPopular
    - Crear `src/app/components/Pricing.tsx` como Server Component
    - Implementar grid responsive (grid-cols-1 en mÃ³vil, grid-cols-3 en desktop)
    - Renderizar cada tier como una card con sombra y hover effect
    - _Requirements: 3.1, 3.2, 3.6, 9.2_
  
  - [x] 4.2 AÃ±adir destacado y CTAs por tier
    - Marcar el tier de 25+ como "MÃ¡s Popular" con badge y borde destacado
    - AÃ±adir botÃ³n CTA "Solicitar CotizaciÃ³n" en cada tier
    - Implementar enlaces que incluyan parÃ¡metro de cantidad: `#contacto?quantity=tier-{id}`
    - AÃ±adir nota disclaimer: "Precios orientativos. CotizaciÃ³n final segÃºn diseÃ±o y especificaciones"
    - _Requirements: 3.3, 3.4, 3.5, 3.7_
  
  - [x] 4.3 Escribir tests unitarios para Pricing
    - Test: renderiza los 3 tiers correctamente
    - Test: tier popular tiene indicador visual
    - Test: cada tier tiene CTA con enlace correcto
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Checkpoint - Verificar estructura base
  - Asegurar que Navigation, Hero y Pricing se renderizan correctamente
  - Verificar navegaciÃ³n smooth scroll entre secciones
  - Probar responsive design en mÃ³vil (320px), tablet (768px) y desktop (1280px)
  - Verificar que no hay errores de consola
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 6. Implementar Process Section
  - [x] 6.1 Crear datos y componente Process
    - Crear archivo de datos con los 4 pasos del proceso
    - Definir interface `ProcessStep` con stepNumber, title, description, icon, timeframe
    - Crear `src/app/components/Process.tsx` como Server Component
    - Implementar layout flexible (flex-col en mÃ³vil, flex-row en desktop)
    - Renderizar cada paso con nÃºmero, icono, tÃ­tulo, descripciÃ³n y timeframe
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.2_
  
  - [x] 6.2 AÃ±adir conectores visuales y CTA final
    - AÃ±adir lÃ­neas conectoras entre pasos (solo visible en desktop)
    - Implementar botÃ³n CTA final "Comenzar Ahora" que enlaza a #contacto
    - Asegurar que los iconos sean accesibles (usar emojis o SVG con aria-label)
    - _Requirements: 4.7, 11.5_
  
  - [x] 6.3 Escribir tests unitarios para Process
    - Test: renderiza los 4 pasos en orden correcto
    - Test: cada paso muestra timeframe
    - Test: CTA final estÃ¡ presente
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

- [x] 7. Implementar Testimonials Section
  - [x] 7.1 Crear datos y componente Testimonials
    - Crear archivo de datos con al menos 3 testimonios
    - Definir interface `Testimonial` con id, customerName, companyName, testimonialText, rating, avatarUrl
    - Crear `src/app/components/Testimonials.tsx` como Server Component
    - Implementar grid responsive (grid-cols-1 en mÃ³vil, grid-cols-3 en desktop)
    - Renderizar cada testimonio como card con sombra
    - _Requirements: 5.1, 5.2, 5.4, 5.7, 9.2_
  
  - [x] 7.2 AÃ±adir ratings y avatars
    - Implementar sistema de estrellas (1-5) usando SVG o Unicode stars (â˜…)
    - AÃ±adir avatares o logos de empresa donde estÃ©n disponibles
    - AÃ±adir heading "Lo que dicen nuestros clientes"
    - Implementar truncado de texto largo con "..." si es necesario
    - _Requirements: 5.3, 5.5, 5.6_
  
  - [x]* 7.3 Escribir tests unitarios para Testimonials
    - Test: renderiza al menos 3 testimonios
    - Test: cada testimonio muestra rating correcto
    - Test: nombres de clientes y empresas se muestran
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Implementar FAQ Section
  - [x] 8.1 Crear datos y componente FAQ
    - Crear archivo de datos con al menos 6 preguntas frecuentes
    - Definir interface `FAQItem` con id, question, answer
    - Crear `src/app/components/FAQ.tsx` como Client Component ('use client')
    - Implementar estado `expandedId` con useState para controlar item expandido
    - Implementar patrÃ³n accordion: solo un item expandido a la vez
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 8.2 AÃ±adir interactividad y CTA final
    - Implementar click handler para expandir/colapsar items
    - AÃ±adir iconos chevron que rotan 180Â° cuando el item estÃ¡ expandido
    - Implementar animaciÃ³n de altura con CSS transitions
    - AÃ±adir CTA final "Â¿MÃ¡s preguntas? ContÃ¡ctanos" que enlaza a #contacto
    - Asegurar accesibilidad con aria-expanded y aria-controls
    - _Requirements: 6.6, 6.7, 6.8, 11.3, 11.5_
  
  - [x]* 8.3 Escribir tests unitarios para FAQ
    - Test: renderiza las 6 preguntas
    - Test: click en pregunta expande la respuesta
    - Test: solo una respuesta expandida a la vez
    - Test: chevron rota correctamente
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Implementar Contact Form
  - [x] 9.1 Crear componente ContactForm con estado
    - Crear `src/app/components/ContactForm.tsx` como Client Component ('use client')
    - Definir interfaces `FormData`, `FormErrors`, `ContactFormState`
    - Implementar estado con useState para formData, errors, isSubmitting, isSuccess
    - Crear campos: name, email, phone, companyName, quantity (selector), message
    - Marcar campos requeridos con asterisco visual
    - Implementar selector de cantidad con opciones predefinidas (10-24, 25-49, 50-99, 100+)
    - _Requirements: 7.1, 7.2, 7.5, 9.6_
  
  - [x] 9.2 Implementar validaciÃ³n del formulario
    - Crear funciÃ³n `validateForm` con reglas de validaciÃ³n
    - Validar campos requeridos: name (min 2 chars), email (formato), phone (formato), companyName, quantity
    - Implementar validaciÃ³n en blur y en submit
    - Mostrar mensajes de error inline debajo de cada campo
    - AÃ±adir borde rojo a campos con error
    - _Requirements: 7.3, 7.4, 7.10_
  
  - [x] 9.3 Implementar submit y estados de Ã©xito
    - Implementar handler de submit que valida el formulario
    - Mostrar mensaje de Ã©xito despuÃ©s de submit exitoso
    - Resetear todos los campos despuÃ©s de submit exitoso
    - Implementar manejo de parÃ¡metro URL `?quantity=` para pre-seleccionar cantidad
    - AÃ±adir nota de privacidad: "Tus datos estÃ¡n protegidos y no serÃ¡n compartidos con terceros"
    - Para MVP, loguear datos a consola (sin backend real)
    - _Requirements: 7.6, 7.7, 7.8, 7.9_
  
  - [x]* 9.4 Escribir tests unitarios para ContactForm
    - Test: renderiza todos los campos correctamente
    - Test: validaciÃ³n muestra errores para campos vacÃ­os
    - Test: validaciÃ³n de formato de email funciona
    - Test: validaciÃ³n de formato de telÃ©fono funciona
    - Test: mensaje de Ã©xito se muestra despuÃ©s de submit
    - Test: formulario se resetea despuÃ©s de submit exitoso
    - Test: cantidad se pre-selecciona desde URL parameter
    - _Requirements: 7.1, 7.3, 7.4, 7.7, 7.8_
  
  - [x]* 9.5 Escribir tests de integraciÃ³n para flujo de cotizaciÃ³n
    - Test: usuario hace clic en CTA de pricing tier
    - Test: formulario aparece en viewport con cantidad pre-seleccionada
    - Test: usuario completa formulario y recibe mensaje de Ã©xito
    - _Requirements: 3.5, 7.7_

- [x] 10. Checkpoint - Verificar funcionalidad completa
  - Probar flujo completo: navegaciÃ³n â†’ pricing â†’ formulario â†’ Ã©xito
  - Verificar que todas las secciones son accesibles desde el menÃº
  - Probar menÃº mÃ³vil en diferentes dispositivos
  - Verificar validaciÃ³n del formulario con casos vÃ¡lidos e invÃ¡lidos
  - Asegurar que no hay errores de consola
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 11. Implementar Footer Component
  - [x] 11.1 Crear componente Footer
    - Crear `src/app/components/Footer.tsx` como Server Component
    - Implementar estructura HTML semÃ¡ntica con `<footer>`
    - Implementar grid de 4 columnas en desktop, stack vertical en mÃ³vil
    - AÃ±adir logo de CAMIART
    - AÃ±adir descripciÃ³n breve de la empresa
    - _Requirements: 8.1, 8.6, 8.7, 8.8, 9.2_
  
  - [x] 11.2 AÃ±adir contenido del Footer
    - AÃ±adir informaciÃ³n de contacto (email, telÃ©fono, direcciÃ³n)
    - AÃ±adir enlaces: PolÃ­tica de Privacidad, TÃ©rminos y Condiciones, PolÃ­tica de EnvÃ­os
    - AÃ±adir iconos de redes sociales con enlaces (Facebook, Instagram, LinkedIn)
    - AÃ±adir copyright con aÃ±o dinÃ¡mico usando `new Date().getFullYear()`
    - Usar fondo oscuro (slate-900) consistente con la marca
    - Implementar hover effects en enlaces
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.9, 11.5_
  
  - [x]* 11.3 Escribir tests unitarios para Footer
    - Test: renderiza todas las secciones (Company Info, Quick Links, Contact, Social Media)
    - Test: copyright muestra aÃ±o actual
    - Test: todos los enlaces estÃ¡n presentes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Integrar todos los componentes en la pÃ¡gina principal
  - [x] 12.1 Actualizar page.tsx con todos los componentes
    - Importar todos los componentes creados
    - Organizar componentes en orden: Navigation, Hero, Pricing, Process, Testimonials, FAQ, ContactForm, Footer
    - AÃ±adir IDs de secciÃ³n apropiados para navegaciÃ³n (#inicio, #ofertas, #proceso, #testimonios, #faq, #contacto)
    - Asegurar que cada secciÃ³n usa elementos HTML semÃ¡nticos (`<section>`, `<main>`)
    - _Requirements: 11.1, 1.2_
  
  - [x] 12.2 Verificar navegaciÃ³n entre secciones
    - Probar que todos los enlaces de navegaciÃ³n funcionan correctamente
    - Verificar smooth scroll entre secciones
    - Probar que los CTAs de pricing enlazan correctamente al formulario
    - Verificar que el parÃ¡metro de cantidad se pasa correctamente
    - _Requirements: 1.5, 2.5, 2.6, 3.5_

- [x] 13. Implementar animaciones y transiciones
  - [x] 13.1 AÃ±adir animaciones de scroll
    - Implementar fade-in effect cuando las secciones entran en viewport
    - Usar Intersection Observer API o librerÃ­a como `framer-motion` si es necesario
    - Asegurar que las animaciones tienen duraciÃ³n entre 200ms y 400ms
    - _Requirements: 12.1, 12.4_
  
  - [x] 13.2 AÃ±adir transiciones de hover y estados
    - Implementar hover transitions en todos los botones CTA
    - AÃ±adir transiciones suaves al abrir/cerrar menÃº mÃ³vil
    - AÃ±adir transiciones suaves al expandir/colapsar FAQ
    - Implementar animaciÃ³n de scroll suave con easing
    - _Requirements: 12.2, 12.3, 12.6_
  
  - [x] 13.3 Implementar respeto a prefers-reduced-motion
    - AÃ±adir media query `@media (prefers-reduced-motion: reduce)` en globals.css
    - Deshabilitar o reducir animaciones para usuarios con esta preferencia
    - Asegurar que la funcionalidad no se pierde sin animaciones
    - _Requirements: 12.5, 12.7_
  
  - [x]* 13.4 Escribir tests para animaciones
    - Test: elementos se animan al entrar en viewport
    - Test: botones tienen hover transitions
    - Test: menÃº mÃ³vil se anima al abrir/cerrar
    - _Requirements: 12.1, 12.2, 12.6_

- [x] 14. OptimizaciÃ³n responsive y accesibilidad
  - [x] 14.1 Verificar responsive design en todos los breakpoints
    - Probar en viewport 320px (mÃ³vil pequeÃ±o)
    - Probar en viewport 375px (mÃ³vil estÃ¡ndar)
    - Probar en viewport 768px (tablet)
    - Probar en viewport 1024px (tablet grande)
    - Probar en viewport 1280px (desktop)
    - Probar en viewport 1920px (desktop grande)
    - Asegurar que no hay scroll horizontal en ningÃºn breakpoint
    - Verificar que el texto es legible sin zoom en todos los dispositivos
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_
  
  - [x] 14.2 Verificar tamaÃ±os de touch targets en mÃ³vil
    - Asegurar que todos los botones tienen mÃ­nimo 44x44px en mÃ³vil
    - Verificar que los enlaces tienen suficiente Ã¡rea de toque
    - Ajustar padding si es necesario para cumplir con el mÃ­nimo
    - _Requirements: 9.6_
  
  - [x] 14.3 Implementar optimizaciÃ³n de imÃ¡genes
    - Usar componente `next/image` para todas las imÃ¡genes
    - Configurar tamaÃ±os responsive apropiados
    - AÃ±adir placeholders para evitar layout shift
    - AÃ±adir alt text descriptivo a todas las imÃ¡genes
    - _Requirements: 9.7, 11.2_
  
  - [x] 14.4 Implementar mejoras de accesibilidad
    - AÃ±adir skip-to-content link al inicio de la pÃ¡gina
    - Verificar jerarquÃ­a de headings (h1 â†’ h2 â†’ h3)
    - AÃ±adir aria-labels a botones con solo iconos (hamburger, social media)
    - Asegurar que todos los elementos interactivos son accesibles por teclado
    - Implementar focus indicators visibles para navegaciÃ³n por teclado
    - _Requirements: 11.1, 11.3, 11.5, 11.6, 11.7, 11.8_
  
  - [x]* 14.5 Verificar contraste de colores
    - Usar herramienta como WebAIM Contrast Checker
    - Asegurar ratio mÃ­nimo 4.5:1 para texto normal
    - Ajustar colores si es necesario para cumplir WCAG 2.1 AA
    - _Requirements: 11.4_

- [x] 15. Checkpoint - Verificar responsive y accesibilidad
  - Probar la pÃ¡gina en diferentes dispositivos fÃ­sicos (iOS, Android)
  - Probar navegaciÃ³n completa con teclado (Tab, Enter, Escape)
  - Verificar con lector de pantalla (NVDA o VoiceOver)
  - Asegurar que todos los touch targets son suficientemente grandes
  - Verificar que las animaciones respetan prefers-reduced-motion
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 16. Implementar optimizaciones de conversiÃ³n
  - [x] 16.1 Optimizar CTAs y trust signals
    - Verificar que hay al menos 3 CTAs visibles above the fold
    - Asegurar que todos los CTAs usan colores contrastantes
    - Verificar que el lenguaje de los CTAs es orientado a la acciÃ³n
    - AÃ±adir trust signals en al menos 2 secciones (hero y pricing)
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [x] 16.2 AÃ±adir elementos de social proof
    - Asegurar que los testimonios son visibles sin scroll excesivo
    - Considerar aÃ±adir contador de clientes o aÃ±os en el negocio
    - AÃ±adir garantÃ­as o badges de confianza si estÃ¡n disponibles
    - _Requirements: 10.3, 10.6_
  
  - [x] 16.3 Optimizar formulario para conversiÃ³n
    - Verificar que el formulario tiene mÃ¡ximo 6 campos requeridos
    - Asegurar que los campos estÃ¡n claramente etiquetados
    - Verificar que los mensajes de error son claros y Ãºtiles
    - Considerar aÃ±adir indicadores de urgencia si son apropiados
    - _Requirements: 10.5, 10.7_

- [x] 17. OptimizaciÃ³n de rendimiento
  - [x] 17.1 Optimizar carga de recursos
    - Configurar `next/font` para optimizar carga de fuentes web
    - Verificar que las imÃ¡genes usan formatos modernos (WebP)
    - Asegurar que Tailwind purga CSS no utilizado
    - Verificar que no hay imports innecesarios en los componentes
    - _Requirements: 10.8_
  
  - [x] 17.2 Ejecutar auditorÃ­a de rendimiento
    - Ejecutar Lighthouse en modo incÃ³gnito
    - Verificar First Contentful Paint (FCP) < 1.5s
    - Verificar Largest Contentful Paint (LCP) < 2.5s
    - Verificar Total Blocking Time (TBT) < 200ms
    - Verificar Cumulative Layout Shift (CLS) < 0.1
    - Objetivo: Performance score > 90
    - _Requirements: 10.8_
  
  - [x]* 17.3 Optimizar bundle size
    - Ejecutar `npm run build` y revisar el tamaÃ±o de los bundles
    - Identificar dependencias grandes innecesarias
    - Considerar code splitting si es necesario
    - Verificar que no hay duplicaciÃ³n de cÃ³digo

- [x] 18. Testing completo
  - [x]* 18.1 Ejecutar suite de tests unitarios
    - Ejecutar todos los tests unitarios con `npm run test`
    - Asegurar que todos los tests pasan
    - Verificar cobertura de cÃ³digo (objetivo: >80% para componentes principales)
  
  - [x]* 18.2 Ejecutar tests de integraciÃ³n
    - Ejecutar tests de flujos de usuario completos
    - Verificar flujo de cotizaciÃ³n end-to-end
    - Verificar flujo de navegaciÃ³n entre secciones
  
  - [ ]* 18.3 Testing manual en navegadores
    - Probar en Chrome (Ãºltima versiÃ³n)
    - Probar en Firefox (Ãºltima versiÃ³n)
    - Probar en Safari (Ãºltima versiÃ³n)
    - Probar en Edge (Ãºltima versiÃ³n)
    - Probar en Chrome Mobile (Android)
    - Probar en Safari Mobile (iOS)
  
  - [x]* 18.4 Testing de accesibilidad automatizado
    - Ejecutar axe DevTools o similar
    - Verificar que no hay violaciones crÃ­ticas de WCAG 2.1 AA
    - Corregir cualquier issue encontrado

- [x] 19. ConfiguraciÃ³n de metadata y SEO
  - [x] 19.1 Configurar metadata en layout.tsx
    - AÃ±adir tÃ­tulo: "CAMIART - Camisetas Personalizadas para Empresas"
    - AÃ±adir descripciÃ³n meta optimizada para SEO
    - AÃ±adir keywords relevantes
    - Configurar Open Graph tags para redes sociales
    - AÃ±adir favicon y app icons
    - _Requirements: 11.1_
  
  - [x] 19.2 Verificar SEO bÃ¡sico
    - Verificar que hay un solo h1 por pÃ¡gina
    - Verificar jerarquÃ­a de headings correcta
    - Asegurar que todos los enlaces tienen texto descriptivo
    - Verificar que las imÃ¡genes tienen alt text
    - _Requirements: 11.2, 11.8_

- [x] 20. Checkpoint final - RevisiÃ³n completa
  - Ejecutar build de producciÃ³n: `npm run build`
  - Verificar que no hay errores de build
  - Ejecutar en modo producciÃ³n: `npm run start`
  - Realizar prueba completa de todos los flujos de usuario
  - Verificar rendimiento con Lighthouse (objetivo: >90)
  - Verificar accesibilidad con herramientas automatizadas
  - Revisar responsive design en todos los breakpoints
  - Preguntar al usuario si estÃ¡ listo para despliegue o si necesita ajustes finales
  - Nota: en Windows, Lighthouse CLI reporta `EPERM` al limpiar temporales de Chrome, pero genera JSON; mÃ©tricas y accesibilidad se respaldan ademÃ¡s con `PERFORMANCE_CHECKPOINT_17.md` y `TESTING_CHECKPOINT_18.md`.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP mÃ¡s rÃ¡pido
- Cada tarea referencia los requisitos especÃ­ficos para trazabilidad
- Los checkpoints aseguran validaciÃ³n incremental y oportunidades para feedback del usuario
- La implementaciÃ³n sigue el principio de Server Components por defecto, usando Client Components solo cuando se necesita interactividad
- **IMPORTANTE**: Leer la documentaciÃ³n de Next.js 16 en `node_modules/next/dist/docs/` antes de comenzar, ya que puede tener breaking changes respecto a versiones anteriores
- El formulario de contacto en MVP solo valida y muestra mensajes; la integraciÃ³n con backend se harÃ¡ en una fase posterior
- Todas las animaciones deben respetar la preferencia `prefers-reduced-motion` del usuario
- El objetivo de rendimiento es Lighthouse score > 90 en todas las mÃ©tricas
- La accesibilidad debe cumplir WCAG 2.1 nivel AA como mÃ­nimo
- Cierre temporal de frontend y reglas de backend documentadas en `CIERRE_FRONTEND_Y_REGLAS_BACKEND.md`
- AuditorÃ­a consolidada de implementaciÃ³n en `AUDITORIA_CIERRE_IMPLEMENTACION_FRONTEND.md`
- API y contrato backend v1 documentados en `API_V1_COTIZACIONES_TECNICO.md`
- Spec backend inicial en `.kiro/specs/backend-cotizaciones-v1/` (requirements, design, tasks, hooks, SKILL)
