<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Staging environment

- **Branch:** `staging` → despliegue automático en <https://staging.camiart.com>
- **Preview deploys:** cada PR a `main` genera una URL de preview automática (Vercel native + GH Action)
- **Staging alias** se asigna automáticamente via GH Action al pushear a `staging`
- **Variables de entorno staging:** configuradas en Vercel Dashboard con scope `Preview`
- **Base de datos staging:** independiente de producción (usar `DATABASE_URL_STAGING` en secrets)
- **Supabase staging:** proyecto separado de producción (`camiart-staging`). Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` apuntan al proyecto staging en deploys Preview. Producción usa su propio proyecto Supabase.

# Deploy workflow (production)

Después de cada cambio importante (feature, fix, refactor), cuando el build pase, los tests estén verdes y se haya validado en staging:

```powershell
Set-Location -LiteralPath "C:\camiprint"
git add -A
git commit -m "<tipo>: <descripción breve>"
git push
vercel --prod
```

# Staging deploy (manual, when not using PR)

```powershell
git checkout -b staging main
git push origin staging
```

Esto dispara el workflow `vercel-preview-deploy.yml` que despliega y asigna el alias `staging.camiart.com`.

No ejecutar los comandos, solo mostrarlos. El usuario los pega en su terminal.
