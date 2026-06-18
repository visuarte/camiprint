# Guía de Estilo CamiArt

## 1. Marca

| Token | Hex | Uso |
|-------|-----|-----|
| `hazard-orange` | `#FF4F00` | Color principal. CTAs, acentos, bordes activos |
| `#0A0A0A` | `#0A0A0A` | Fondo hero, footer, secciones oscuras |
| `#131313` | `#131313` | Fondo general de página |
| `#1f1f1f` | `#1f1f1f` | Tarjetas, contenedores elevados |
| `#e2e2e2` | `#e2e2e2` | Texto principal sobre fondo oscuro |
| `#e2e2e2/60` | rgba(226,226,226,0.6) | Texto secundario / descripciones |
| `#e2e2e2/40` | rgba(226,226,226,0.4) | Texto terciario / metadatos |

## 2. Tipografía

| Token | Font | Uso |
|-------|------|-----|
| `font-sans` | Manrope | Texto body, párrafos, inputs |
| `font-display` | Space Grotesk | Titulares, etiquetas, mayúsculas |
| `font-mono` | Courier New | Código, precios (no usar) |

### Tamaños

| Clase | Tamaño | Line-height | Uso |
|-------|--------|-------------|-----|
| `text-display-lg` | 80px | 1.0 | Hero principal (solo landing) |
| `text-headline-lg` | 48px | 1.1 | Títulos de sección |
| `text-headline-md` | 24px | 1.3 | Títulos de tarjeta |
| `text-label-caps` | 14px | 1.0 | Mayúsculas trackeadas, etiquetas |
| `text-body-lg` | 18px | 1.6 | Párrafos destacados |
| `text-body-md` | 16px | 1.6 | Texto base |

### Reglas

- **Titulares**: `font-display` + `tracking-[-0.04em]` siempre
- **Body**: `font-sans` + `text-wrap: pretty`
- **Labels/mayúsculas**: `font-display` + `tracking-[0.1em]` + `uppercase`
- **Nunca** usar cursiva en titulares. Solo en citas (testimonios).

## 3. Botones

### Primario (naranja)
```
bg-[#ff4f00] text-[#0A0A0A] font-bold px-10 py-4 text-sm
transition hover:scale-105
```
- Úsalo para la acción principal de la página
- Solo UNO por sección

### Secundario (borde)
```
border border-[#e2e2e2]/20 text-[#e2e2e2] font-bold px-10 py-4 text-sm
transition hover:border-[#ff4f00]
```
- Para acciones secundarias
- Misma altura que el primario (mismo padding)

### Pequeño (tablas/admin)
```
bg-[#ff4f00] text-[#0A0A0A] font-bold px-6 py-2 text-xs
transition hover:scale-105
```
- Solo en el panel de administración

## 4. Tarjetas / Cards

```
border border-[#5c4037]/35 bg-[#1f1f1f] p-8
transition-all hover:border-[#ff4f00]
```

- Esquinas: `rounded-[1.5rem]` (solo landing) o `rounded-lg` (admin)
- Sombra hover: `hover:-translate-y-1` (landing) o ninguna (admin)
- Padding interior: siempre `p-5` o `p-8`

## 5. Inputs

```
bg-[#1f1f1f] border border-[#e2e2e2]/12 rounded-xl
px-4 py-3 text-white placeholder:text-[#e2e2e2]/40
focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30
```

## 6. Separadores

```
border-[#5c4037]/25   → marrón tenue (landing)
border-white/10        → blanco tenue (ecommerce/admin)
```

## 7. Secciones

| Sección | Fondo | Padding vertical |
|---------|-------|-----------------|
| Hero | `bg-[#0A0A0A]` | `pt-28 pb-20` |
| Stats bar | `bg-[#0e0e0e]` | `py-10` |
| Contenido | `bg-[#131313]` | `py-24` |
| Testimonios | `bg-[#0A0A0A]` | `py-24` |
| CTA final | `bg-[#0A0A0A]` | `py-24` |

## 8. Header

```
fixed top-0 z-50 h-20
border-b border-[#ff4f00]/35
bg-[#131313]/92 backdrop-blur-xl
shadow-[0_6px_26px_rgba(255,79,0,0.18)]
```

- Logo: 40x40px, `object-contain`
- Nav items: `text-sm tracking-[0.1em]`
- Active: `text-[#ff4f00] [text-shadow:0_0_8px_rgba(255,79,0,0.6)]`
- Inactive: `text-[#e2e2e2]/70 hover:text-[#e2e2e2]`
- Altura fija: `h-20` (80px)
- Offset del contenido: `pt-20` (o `h-20` + `pt-20` en el primer elemento)

## 9. Patrón Hazard

Solo para fondos decorativos:
```
.hazard-pattern {
  background-image: repeating-linear-gradient(-45deg, #ff4f00, #ff4f00 10px, transparent 10px, transparent 20px);
}
```
- Opacidad máxima: `opacity-10`
- Nunca sobre texto

## 10. Animaciones

```
hover:scale-105   → botones primarios
hover:-translate-y-1 → tarjetas
animate-pulse     → indicadores de estado (punto naranja)
animate-slideDown → menús, notificaciones
```

---

## Referencia rápida

```tsx
// Botón primario
<button className="bg-[#ff4f00] px-10 py-4 text-sm font-bold text-[#0A0A0A] transition hover:scale-105">

// Botón secundario
<button className="border border-[#e2e2e2]/20 px-10 py-4 text-sm font-bold text-[#e2e2e2] transition hover:border-[#ff4f00]">

// Tarjeta
<div className="border border-[#5c4037]/35 bg-[#1f1f1f] p-8 transition-all hover:border-[#ff4f00]">

// Input
<input className="w-full rounded-xl border border-[#e2e2e2]/12 bg-[#1f1f1f] px-4 py-3 text-white placeholder:text-[#e2e2e2]/40 focus:border-[#ff4f00]/50 focus:outline-none focus:ring-1 focus:ring-[#ff4f00]/30">

// Título de sección
<h2 className="font-display text-4xl font-black md:text-5xl">

// Label mayúscula
<span className="font-display text-xs tracking-[0.1em] text-[#ff4f00] uppercase">
```
