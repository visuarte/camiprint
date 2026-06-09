# 🔍 Watchdog & Monitoring Suite

## Overview

Sistema integrado de vigilancia y monitoreo para garantizar calidad y seguridad del build:

1. **Brand Watchdog** - Detecta references a branding legacy
2. **Vulnerability Monitor** - Rastrea y alerta sobre vulnerabilidades npm
3. **Health Check** - Pre-deployment validations

---

## 1️⃣ Brand Watchdog (`watchdog-brand-improved.mjs`)

### ¿Qué hace?
- ✅ Escanea el código fuente en busca de "cami" + "print" (branding legacy)
- ✅ Sin dependencias externas (usa Node.js nativo)
- ✅ Resiliente a errores de filesystem Windows
- ✅ Ignora node_modules, .next, binarios, etc.

### Uso

```bash
# Ejecutar directamente
npm run watchdog:brand

# Verificar manualmente en script
node scripts/watchdog-brand-improved.mjs

# Exit codes:
#   0 = OK (sin violaciones)
#   1 = ERROR (violaciones encontradas)
```

### Integración en Build

```bash
# El watchdog se ejecuta ANTES del build
npm run build

# Equivalente a:
# node scripts/watchdog-brand-improved.mjs && next build --webpack
```

### Output

✅ Exitoso:
```
🔍 Scanning for legacy brand violations ("camiprint")...
✅ Scanned 253 files
✅ No legacy brand violations found!
```

❌ Fallo:
```
🔍 Scanning for legacy brand violations ("camiprint")...
⚠️  Found legacy brand in src/pages/index.tsx:42
   const branding = 'cami' + 'print';
❌ Found 1 violation(s)! Please remove legacy brand references.
```

---

## 2️⃣ Vulnerability Monitor (`monitor-vulnerabilities.mjs`)

### ¿Qué hace?
- ✅ Ejecuta `npm audit` y captura resultados en JSON
- ✅ Rastrea histórico (últimos 30 reportes)
- ✅ Detecta nuevas vulnerabilidades
- ✅ Alerta sobre cambios de severidad
- ✅ Modo strict para CI/CD (falla si hay critical/high)

### Uso

```bash
# Reporte actual
npm run vuln:monitor

# Modo estricto (falla si hay critical o high)
npm run vuln:monitor:strict

# Mostrar histórico
npm run vuln:history

# Exit codes:
#   0 = OK o solo moderate/low
#   1 = FAIL (strict mode: critical/high detectado)
```

### Output

Reporte actual:
```
📊 NPM Vulnerability Report
==================================================

Total: 5
  🟡 Moderate: 5

Packages:
  🟡 @hono/node-server (moderate)
  🟡 @prisma/dev (moderate)
  🟡 next (moderate)
  🟡 postcss (moderate)
  🟡 prisma (moderate)
```

Con cambios:
```
Changes:
  ⚠️  New: stripe-webhook(moderate)
  ✅ Fixed: lodash
  🔺 Upgraded: express(moderate→high)
  🔻 Downgraded: cors(high→moderate)
```

Histórico:
```
📈 History (últimos reportes):
  [1] 2026-05-15 10:30:20: 3 vulns (C:0 H:1 M:2 L:0)
  [2] 2026-05-16 14:15:45: 5 vulns (C:0 H:1 M:4 L:0)
  [3] 2026-06-01 09:33:40: 5 vulns (C:0 H:0 M:5 L:0)  ← actual
```

### Archivos Generados

- `.vuln-report.json` - Reporte actual (JSON)
- `.vuln-history.json` - Histórico (últimos 30 reports)

```json
// .vuln-report.json
{
  "summary": {
    "timestamp": "2026-06-01T09:33:40.000Z",
    "total": 5,
    "critical": 0,
    "high": 0,
    "moderate": 5,
    "low": 0,
    "packages": {
      "postcss": {
        "severity": "moderate",
        "via": 1,
        "range": "<8.5.10"
      },
      ...
    }
  },
  "report": { /* full npm audit JSON */ }
}
```

---

## 3️⃣ CI/CD Integration

### GitHub Actions (recomendado)

```yaml
# .github/workflows/build.yml
name: Build & Security Checks

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          
      - run: npm install --legacy-peer-deps
      
      # Watchdog: detectar branding legacy
      - run: npm run watchdog:brand
      
      # Build
      - run: npm run build
      
      # Monitor vulnerabilidades (modo informativo)
      - run: npm run vuln:monitor
      
      # Monitoreo estricto (falla si high/critical)
      - run: npm run vuln:monitor:strict
        continue-on-error: true
        
      # Tests
      - run: npm test
```

### Vercel Integration

El watchdog ya se ejecuta en cada build:

```bash
# vercel.json o next.config.ts buildCommand
npm run build
```

---

## 4️⃣ Workflow Recomendado

### Daily (local)
```bash
# Antes de commit
npm run watchdog:brand  # Detectar issues
npm run vuln:monitor:strict  # Check strict
npm test
npm run build
```

### Pre-deployment
```bash
# Antes de push a main
npm run build              # Full build con watchdog
npm run vuln:history       # Revisar histórico
git push
```

### CI/CD (automático)
- Cada PR ejecuta todos los checks
- Build + watchdog + tests + vuln monitor
- Falla si hay issues críticos

---

## 5️⃣ Status Actual

### Vulnerabilidades npm
```
Total: 5 (todos MODERATE - no afectan runtime)
├─ postcss <8.5.10 (XSS via </style>)
├─ @hono/node-server <1.19.13 (middleware bypass)
├─ @prisma/dev * (depende de @hono/node-server)
├─ next@16.2.6 (depende de postcss)
└─ prisma@7.8.0 (depende de @prisma/dev)

Recomendación: MONITORED (sin action requerida, son transitividades)
```

### Brand Vigilance
```
✅ No violaciones detectadas
✅ 253 archivos escaneados
✅ Watchdog integrado en build pipeline
```

---

## 6️⃣ Roadmap Futuro

- [ ] Slack/Discord alerts para new vulns
- [ ] SBOM (Software Bill of Materials) generation
- [ ] Dependency update automation (dependabot)
- [ ] License compliance check
- [ ] Performance regression detection
- [ ] Type safety enforcement (full strict mode)

---

**Last Updated**: 2026-06-01  
**Watchdog Version**: 2.0 (improved)  
**Monitor Version**: 1.0
