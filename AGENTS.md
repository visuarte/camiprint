<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git Flow: 3 entornos

## Ramas
- `main` → **producción** (<https://camiart.com>)
- `develop` → **staging** (<https://staging.camiart.com>)
- `feature/*` → desarrollo **local**

## Flujo diario
1. `git checkout -b feature/lo-que-sea develop` — trabajas local, `npm run build` pasa
2. `git push origin feature/lo-que-sea` + **PR a `develop`** → preview deploy automático + tests smoke
3. Se valida en <https://staging.camiart.com>
4. **PR a `main`** → deploy a producción automático

## Preview deploys automáticos
- Push a `develop` → deploy + alias `staging.camiart.com` via GH Action
- PR a `main` → preview URL comment automático en el PR + smoke tests
- PR a `develop` → preview URL comment automático

## Variables de entorno
- Scope **Production** → proyecto Supabase de producción
- Scope **Preview** → proyecto Supabase staging (`yqcyhpyrjxfzpbrxhohv`)
- Scope **Development** (local) → `.env.local`

# Deploy manual (producción)

```powershell
Set-Location -LiteralPath "C:\camiprint"
git add -A
git commit -m "<tipo>: <descripción breve>"
git push
vercel --prod
```

# Comandos útiles

```powershell
# Crear develop si no existe
git checkout -b develop main
git push origin develop

# Pull + rebase develop sobre main
git checkout develop
git pull --rebase origin main

# Feature branch desde develop
git checkout -b feature/mi-cambio develop
```

No ejecutar los comandos automáticamente, solo mostrarlos. El usuario los pega en su terminal.
