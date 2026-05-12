# Implementation Plan: Ecommerce Landing Page

## Overview

Este plan de implementación transforma la landing page básica de Camiprint en una plataforma de ecommerce profesional y optimizada para conversión. La implementación utiliza Next.js 16.2.6, React 19, TypeScript y Tailwind CSS 4, siguiendo una arquitectura basada en componentes con Server Components por defecto y Client Components solo cuando sea necesario para interactividad.

El plan está organizado en 6 fases que cubren desde la configuración inicial hasta el despliegue final, con énfasis en responsive design, accesibilidad WCAG 2.1 AA, y optimización de conversión.

## Tasks

- [x] 1. Configuración inicial y estructura del proyecto
  - Verificar versiones de Next.js 16.2.6, React 19 y Tailwind CSS 4
  - Leer la documentación de Next.js 16 en `node_modules/next/dist/docs/` para identificar breaking changes
  - Crear estructura de directorios para componentes: `src/app/components/`
  - Configurar Tailwind CSS 4 con las utilidades necesarias (forms, typography si es necesario)
  - Configurar archivo `globals.css` con directivas de Tailwind y estilos base
  - Añadir `scroll-behavior: smooth` al elemento html para navegación suave
  - Configurar metadata SEO en `layout.tsx` (título, descripción, keywords, Open Graph)
  - _Requirements: 11.1, 11.2_

- [x] 2. Implementar Navigation Component
  - [x] 2.1 Crear componente Navigation con parte Server y Client
    - Crear `src/app/components/Navigation.tsx` como Client Component ('use client')
    - Implementar estructura HTML semántica con `<nav>` y `<header>`
    - Añadir logo de Camiprint en el lado izquierdo
    - Implementar enlaces de navegación a secciones (Inicio, Ofertas, Proceso, Testimonios, FAQ, Contacto)
    - Añadir botón CTA principal "Solicitar Cotización" que enlaza a #contacto
    - Implementar posicionamiento fijo con `position: fixed` y `backdrop-blur`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8_
  
  - [x] 2.2 Implementar menú móvil responsive
    - Añadir estado `isMobileMenuOpen` con useState
    - Implementar icono hamburguesa visible solo en viewport < 768px
    - Crear menú móvil que se desliza desde la derecha con animación transform
    - Implementar toggle del menú al hacer clic en el icono hamburguesa
    - Añadir funcionalidad para cerrar menú al hacer clic fuera o en un enlace
    - Asegurar que todos los enlaces de navegación funcionen con smooth scroll
    - _Requirements: 1.5, 1.6, 1.7, 9.2, 9.6_
  
  - [x] 2.3 Escribir tests unitarios para Navigation
    - Test: renderiza todos los enlaces de navegación
    - Test: menú móvil se abre y cierra correctamente
    - Test: botón CTA está presente y enlaza a #contacto
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implementar Hero Section
  - [x] 3.1 Crear componente Hero
    - Crear `src/app/components/Hero.tsx` como Server Component
    - Implementar estructura HTML semántica con `<section>` y heading `<h1>`
    - Añadir título principal con la propuesta de valor de Camiprint
    - Añadir subtítulo descriptivo explicando el servicio
    - Implementar fondo con gradiente (slate-900 a blue-800) usando utilidades de Tailwind
    - Asegurar texto responsive (text-3xl en móvil, text-5xl en desktop)
    - _Requirements: 2.1, 2.2, 2.8, 9.5_
  
  - [x] 3.2 Añadir CTAs y trust indicators
    - Implementar botón CTA primario "Ver Ofertas" que enlaza a #ofertas
    - Implementar botón CTA secundario "Solicitar Cotización" que enlaza a #contacto
    - Añadir trust indicators: "Entrega en 7-10 días", "Desde 50 unidades", "Diseño gratuito"
    - Estilizar trust indicators como badges o icon + text
    - Asegurar contraste de color adecuado (ratio 4.5:1) para accesibilidad
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 10.1, 10.2, 11.4_
  
  - [x] 3.3 Escribir tests unitarios para Hero
    - Test: renderiza heading y subheading correctamente
    - Test: ambos CTAs están presentes con texto correcto
    - Test: trust indicators se muestran correctamente
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implementar Pricing Section
  - [x] 4.1 Crear datos y componente Pricing
    - Crear archivo de datos con los 3 pricing tiers (10+, 25+, 50+ unidades)
    - Definir interface `PricingTier` con id, quantity, pricePerUnit, savings, isPopular
    - Crear `src/app/components/Pricing.tsx` como Server Component
    - Implementar grid responsive (grid-cols-1 en móvil, grid-cols-3 en desktop)
    - Renderizar cada tier como una card con sombra y hover effect
    - _Requirements: 3.1, 3.2, 3.6, 9.2_
  
  - [x] 4.2 Añadir destacado y CTAs por tier
    - Marcar el tier de 25+ como "Más Popular" con badge y borde destacado
    - Añadir botón CTA "Solicitar Cotización" en cada tier
    - Implementar enlaces que incluyan parámetro de cantidad: `#contacto?quantity=tier-{id}`
    - Añadir nota disclaimer: "Precios orientativos. Cotización final según diseño y especificaciones"
    - _Requirements: 3.3, 3.4, 3.5, 3.7_
  
  - [x] 4.3 Escribir tests unitarios para Pricing
    - Test: renderiza los 3 tiers correctamente
    - Test: tier popular tiene indicador visual
    - Test: cada tier tiene CTA con enlace correcto
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Checkpoint - Verificar estructura base
  - Asegurar que Navigation, Hero y Pricing se renderizan correctamente
  - Verificar navegación smooth scroll entre secciones
  - Probar responsive design en móvil (320px), tablet (768px) y desktop (1280px)
  - Verificar que no hay errores de consola
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 6. Implementar Process Section
  - [x] 6.1 Crear datos y componente Process
    - Crear archivo de datos con los 4 pasos del proceso
    - Definir interface `ProcessStep` con stepNumber, title, description, icon, timeframe
    - Crear `src/app/components/Process.tsx` como Server Component
    - Implementar layout flexible (flex-col en móvil, flex-row en desktop)
    - Renderizar cada paso con número, icono, título, descripción y timeframe
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.2_
  
  - [x] 6.2 Añadir conectores visuales y CTA final
    - Añadir líneas conectoras entre pasos (solo visible en desktop)
    - Implementar botón CTA final "Comenzar Ahora" que enlaza a #contacto
    - Asegurar que los iconos sean accesibles (usar emojis o SVG con aria-label)
    - _Requirements: 4.7, 11.5_
  
  - [x] 6.3 Escribir tests unitarios para Process
    - Test: renderiza los 4 pasos en orden correcto
    - Test: cada paso muestra timeframe
    - Test: CTA final está presente
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

- [x] 7. Implementar Testimonials Section
  - [x] 7.1 Crear datos y componente Testimonials
    - Crear archivo de datos con al menos 3 testimonios
    - Definir interface `Testimonial` con id, customerName, companyName, testimonialText, rating, avatarUrl
    - Crear `src/app/components/Testimonials.tsx` como Server Component
    - Implementar grid responsive (grid-cols-1 en móvil, grid-cols-3 en desktop)
    - Renderizar cada testimonio como card con sombra
    - _Requirements: 5.1, 5.2, 5.4, 5.7, 9.2_
  
  - [x] 7.2 Añadir ratings y avatars
    - Implementar sistema de estrellas (1-5) usando SVG o Unicode stars (★)
    - Añadir avatares o logos de empresa donde estén disponibles
    - Añadir heading "Lo que dicen nuestros clientes"
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
    - Implementar patrón accordion: solo un item expandido a la vez
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 8.2 Añadir interactividad y CTA final
    - Implementar click handler para expandir/colapsar items
    - Añadir iconos chevron que rotan 180° cuando el item está expandido
    - Implementar animación de altura con CSS transitions
    - Añadir CTA final "¿Más preguntas? Contáctanos" que enlaza a #contacto
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
  
  - [x] 9.2 Implementar validación del formulario
    - Crear función `validateForm` con reglas de validación
    - Validar campos requeridos: name (min 2 chars), email (formato), phone (formato), companyName, quantity
    - Implementar validación en blur y en submit
    - Mostrar mensajes de error inline debajo de cada campo
    - Añadir borde rojo a campos con error
    - _Requirements: 7.3, 7.4, 7.10_
  
  - [x] 9.3 Implementar submit y estados de éxito
    - Implementar handler de submit que valida el formulario
    - Mostrar mensaje de éxito después de submit exitoso
    - Resetear todos los campos después de submit exitoso
    - Implementar manejo de parámetro URL `?quantity=` para pre-seleccionar cantidad
    - Añadir nota de privacidad: "Tus datos están protegidos y no serán compartidos con terceros"
    - Para MVP, loguear datos a consola (sin backend real)
    - _Requirements: 7.6, 7.7, 7.8, 7.9_
  
  - [x]* 9.4 Escribir tests unitarios para ContactForm
    - Test: renderiza todos los campos correctamente
    - Test: validación muestra errores para campos vacíos
    - Test: validación de formato de email funciona
    - Test: validación de formato de teléfono funciona
    - Test: mensaje de éxito se muestra después de submit
    - Test: formulario se resetea después de submit exitoso
    - Test: cantidad se pre-selecciona desde URL parameter
    - _Requirements: 7.1, 7.3, 7.4, 7.7, 7.8_
  
  - [x]* 9.5 Escribir tests de integración para flujo de cotización
    - Test: usuario hace clic en CTA de pricing tier
    - Test: formulario aparece en viewport con cantidad pre-seleccionada
    - Test: usuario completa formulario y recibe mensaje de éxito
    - _Requirements: 3.5, 7.7_

- [x] 10. Checkpoint - Verificar funcionalidad completa
  - Probar flujo completo: navegación → pricing → formulario → éxito
  - Verificar que todas las secciones son accesibles desde el menú
  - Probar menú móvil en diferentes dispositivos
  - Verificar validación del formulario con casos válidos e inválidos
  - Asegurar que no hay errores de consola
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 11. Implementar Footer Component
  - [x] 11.1 Crear componente Footer
    - Crear `src/app/components/Footer.tsx` como Server Component
    - Implementar estructura HTML semántica con `<footer>`
    - Implementar grid de 4 columnas en desktop, stack vertical en móvil
    - Añadir logo de Camiprint
    - Añadir descripción breve de la empresa
    - _Requirements: 8.1, 8.6, 8.7, 8.8, 9.2_
  
  - [x] 11.2 Añadir contenido del Footer
    - Añadir información de contacto (email, teléfono, dirección)
    - Añadir enlaces: Política de Privacidad, Términos y Condiciones, Política de Envíos
    - Añadir iconos de redes sociales con enlaces (Facebook, Instagram, LinkedIn)
    - Añadir copyright con año dinámico usando `new Date().getFullYear()`
    - Usar fondo oscuro (slate-900) consistente con la marca
    - Implementar hover effects en enlaces
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.9, 11.5_
  
  - [x]* 11.3 Escribir tests unitarios para Footer
    - Test: renderiza todas las secciones (Company Info, Quick Links, Contact, Social Media)
    - Test: copyright muestra año actual
    - Test: todos los enlaces están presentes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Integrar todos los componentes en la página principal
  - [x] 12.1 Actualizar page.tsx con todos los componentes
    - Importar todos los componentes creados
    - Organizar componentes en orden: Navigation, Hero, Pricing, Process, Testimonials, FAQ, ContactForm, Footer
    - Añadir IDs de sección apropiados para navegación (#inicio, #ofertas, #proceso, #testimonios, #faq, #contacto)
    - Asegurar que cada sección usa elementos HTML semánticos (`<section>`, `<main>`)
    - _Requirements: 11.1, 1.2_
  
  - [x] 12.2 Verificar navegación entre secciones
    - Probar que todos los enlaces de navegación funcionan correctamente
    - Verificar smooth scroll entre secciones
    - Probar que los CTAs de pricing enlazan correctamente al formulario
    - Verificar que el parámetro de cantidad se pasa correctamente
    - _Requirements: 1.5, 2.5, 2.6, 3.5_

- [x] 13. Implementar animaciones y transiciones
  - [x] 13.1 Añadir animaciones de scroll
    - Implementar fade-in effect cuando las secciones entran en viewport
    - Usar Intersection Observer API o librería como `framer-motion` si es necesario
    - Asegurar que las animaciones tienen duración entre 200ms y 400ms
    - _Requirements: 12.1, 12.4_
  
  - [x] 13.2 Añadir transiciones de hover y estados
    - Implementar hover transitions en todos los botones CTA
    - Añadir transiciones suaves al abrir/cerrar menú móvil
    - Añadir transiciones suaves al expandir/colapsar FAQ
    - Implementar animación de scroll suave con easing
    - _Requirements: 12.2, 12.3, 12.6_
  
  - [x] 13.3 Implementar respeto a prefers-reduced-motion
    - Añadir media query `@media (prefers-reduced-motion: reduce)` en globals.css
    - Deshabilitar o reducir animaciones para usuarios con esta preferencia
    - Asegurar que la funcionalidad no se pierde sin animaciones
    - _Requirements: 12.5, 12.7_
  
  - [x]* 13.4 Escribir tests para animaciones
    - Test: elementos se animan al entrar en viewport
    - Test: botones tienen hover transitions
    - Test: menú móvil se anima al abrir/cerrar
    - _Requirements: 12.1, 12.2, 12.6_

- [x] 14. Optimización responsive y accesibilidad
  - [x] 14.1 Verificar responsive design en todos los breakpoints
    - Probar en viewport 320px (móvil pequeño)
    - Probar en viewport 375px (móvil estándar)
    - Probar en viewport 768px (tablet)
    - Probar en viewport 1024px (tablet grande)
    - Probar en viewport 1280px (desktop)
    - Probar en viewport 1920px (desktop grande)
    - Asegurar que no hay scroll horizontal en ningún breakpoint
    - Verificar que el texto es legible sin zoom en todos los dispositivos
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_
  
  - [x] 14.2 Verificar tamaños de touch targets en móvil
    - Asegurar que todos los botones tienen mínimo 44x44px en móvil
    - Verificar que los enlaces tienen suficiente área de toque
    - Ajustar padding si es necesario para cumplir con el mínimo
    - _Requirements: 9.6_
  
  - [x] 14.3 Implementar optimización de imágenes
    - Usar componente `next/image` para todas las imágenes
    - Configurar tamaños responsive apropiados
    - Añadir placeholders para evitar layout shift
    - Añadir alt text descriptivo a todas las imágenes
    - _Requirements: 9.7, 11.2_
  
  - [x] 14.4 Implementar mejoras de accesibilidad
    - Añadir skip-to-content link al inicio de la página
    - Verificar jerarquía de headings (h1 → h2 → h3)
    - Añadir aria-labels a botones con solo iconos (hamburger, social media)
    - Asegurar que todos los elementos interactivos son accesibles por teclado
    - Implementar focus indicators visibles para navegación por teclado
    - _Requirements: 11.1, 11.3, 11.5, 11.6, 11.7, 11.8_
  
  - [x]* 14.5 Verificar contraste de colores
    - Usar herramienta como WebAIM Contrast Checker
    - Asegurar ratio mínimo 4.5:1 para texto normal
    - Ajustar colores si es necesario para cumplir WCAG 2.1 AA
    - _Requirements: 11.4_

- [x] 15. Checkpoint - Verificar responsive y accesibilidad
  - Probar la página en diferentes dispositivos físicos (iOS, Android)
  - Probar navegación completa con teclado (Tab, Enter, Escape)
  - Verificar con lector de pantalla (NVDA o VoiceOver)
  - Asegurar que todos los touch targets son suficientemente grandes
  - Verificar que las animaciones respetan prefers-reduced-motion
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [ ] 16. Implementar optimizaciones de conversión
  - [ ] 16.1 Optimizar CTAs y trust signals
    - Verificar que hay al menos 3 CTAs visibles above the fold
    - Asegurar que todos los CTAs usan colores contrastantes
    - Verificar que el lenguaje de los CTAs es orientado a la acción
    - Añadir trust signals en al menos 2 secciones (hero y pricing)
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ] 16.2 Añadir elementos de social proof
    - Asegurar que los testimonios son visibles sin scroll excesivo
    - Considerar añadir contador de clientes o años en el negocio
    - Añadir garantías o badges de confianza si están disponibles
    - _Requirements: 10.3, 10.6_
  
  - [ ] 16.3 Optimizar formulario para conversión
    - Verificar que el formulario tiene máximo 6 campos requeridos
    - Asegurar que los campos están claramente etiquetados
    - Verificar que los mensajes de error son claros y útiles
    - Considerar añadir indicadores de urgencia si son apropiados
    - _Requirements: 10.5, 10.7_

- [ ] 17. Optimización de rendimiento
  - [ ] 17.1 Optimizar carga de recursos
    - Configurar `next/font` para optimizar carga de fuentes web
    - Verificar que las imágenes usan formatos modernos (WebP)
    - Asegurar que Tailwind purga CSS no utilizado
    - Verificar que no hay imports innecesarios en los componentes
    - _Requirements: 10.8_
  
  - [ ] 17.2 Ejecutar auditoría de rendimiento
    - Ejecutar Lighthouse en modo incógnito
    - Verificar First Contentful Paint (FCP) < 1.5s
    - Verificar Largest Contentful Paint (LCP) < 2.5s
    - Verificar Total Blocking Time (TBT) < 200ms
    - Verificar Cumulative Layout Shift (CLS) < 0.1
    - Objetivo: Performance score > 90
    - _Requirements: 10.8_
  
  - [ ]* 17.3 Optimizar bundle size
    - Ejecutar `npm run build` y revisar el tamaño de los bundles
    - Identificar dependencias grandes innecesarias
    - Considerar code splitting si es necesario
    - Verificar que no hay duplicación de código

- [ ] 18. Testing completo
  - [ ]* 18.1 Ejecutar suite de tests unitarios
    - Ejecutar todos los tests unitarios con `npm run test`
    - Asegurar que todos los tests pasan
    - Verificar cobertura de código (objetivo: >80% para componentes principales)
  
  - [ ]* 18.2 Ejecutar tests de integración
    - Ejecutar tests de flujos de usuario completos
    - Verificar flujo de cotización end-to-end
    - Verificar flujo de navegación entre secciones
  
  - [ ]* 18.3 Testing manual en navegadores
    - Probar en Chrome (última versión)
    - Probar en Firefox (última versión)
    - Probar en Safari (última versión)
    - Probar en Edge (última versión)
    - Probar en Chrome Mobile (Android)
    - Probar en Safari Mobile (iOS)
  
  - [ ]* 18.4 Testing de accesibilidad automatizado
    - Ejecutar axe DevTools o similar
    - Verificar que no hay violaciones críticas de WCAG 2.1 AA
    - Corregir cualquier issue encontrado

- [ ] 19. Configuración de metadata y SEO
  - [ ] 19.1 Configurar metadata en layout.tsx
    - Añadir título: "Camiprint - Camisetas Personalizadas para Empresas"
    - Añadir descripción meta optimizada para SEO
    - Añadir keywords relevantes
    - Configurar Open Graph tags para redes sociales
    - Añadir favicon y app icons
    - _Requirements: 11.1_
  
  - [ ] 19.2 Verificar SEO básico
    - Verificar que hay un solo h1 por página
    - Verificar jerarquía de headings correcta
    - Asegurar que todos los enlaces tienen texto descriptivo
    - Verificar que las imágenes tienen alt text
    - _Requirements: 11.2, 11.8_

- [ ] 20. Checkpoint final - Revisión completa
  - Ejecutar build de producción: `npm run build`
  - Verificar que no hay errores de build
  - Ejecutar en modo producción: `npm run start`
  - Realizar prueba completa de todos los flujos de usuario
  - Verificar rendimiento con Lighthouse (objetivo: >90)
  - Verificar accesibilidad con herramientas automatizadas
  - Revisar responsive design en todos los breakpoints
  - Preguntar al usuario si está listo para despliegue o si necesita ajustes finales

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental y oportunidades para feedback del usuario
- La implementación sigue el principio de Server Components por defecto, usando Client Components solo cuando se necesita interactividad
- **IMPORTANTE**: Leer la documentación de Next.js 16 en `node_modules/next/dist/docs/` antes de comenzar, ya que puede tener breaking changes respecto a versiones anteriores
- El formulario de contacto en MVP solo valida y muestra mensajes; la integración con backend se hará en una fase posterior
- Todas las animaciones deben respetar la preferencia `prefers-reduced-motion` del usuario
- El objetivo de rendimiento es Lighthouse score > 90 en todas las métricas
- La accesibilidad debe cumplir WCAG 2.1 nivel AA como mínimo
