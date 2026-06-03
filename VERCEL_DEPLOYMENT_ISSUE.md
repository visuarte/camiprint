> Nota de migracion (2026-06-03): este documento fue normalizado a marca CamiArt y dominio can�nico camiart.com. Se mantienen identificadores tecnicos historicos cuando aportan trazabilidad.
# Vercel Deployment Issue - Debugging Guide

## Current Status

**Issue**: All routes on `https://camiart.com` return **404 Not Found** except homepage (which loads but shows "Camiart" instead of "CAMIART").

- ❌ `/catalog` → 404
- ❌ `/checkout` → 404  
- ❌ `/admin` → 404
- ❌ `/api/products` → 404
- ❌ All other routes → 404
- ⚠️ Health check → 503 Service Unavailable

## What We've Tried

1. ✅ Fixed `QUOTES_REPOSITORY_DRIVER` from postgres to json (removed DATABASE_URL requirement)
2. ✅ Removed custom `buildCommand` to use Next.js default
3. ✅ Removed `middleware.ts` temporarily (not the cause)
4. ✅ Forced full rebuilds by changing version
5. ❌ All attempts resulted in same 404 errors

## Why This is Puzzling

- The Next.js server IS running (homepage loads with status 200)
- All necessary files exist in the repository and are committed to Git
- Local tests show all pages work correctly
- Build commands complete without errors

## Next Steps to Try (Requires Vercel Dashboard Access)

### 1. Check Vercel Build Logs
Go to: https://vercel.com/dashboard → Select CAMIART project → Deployments tab
- Click on the latest deployment
- Check "Build" tab for any errors or warnings
- Look for: "Failed to compile", "Build error", or missing files

### 2. Check Vercel Runtime Logs
- In the same deployment view, click "Runtime Logs"
- Look for errors when Next.js starts
- Check if routes are being recognized

### 3. Verify Environment Variables
Settings → Environment Variables:
- Confirm all required variables are set:
  - `NODE_ENV=production`
  - `QUOTES_REPOSITORY_DRIVER=json`
  - `RATE_LIMIT_STORE_DRIVER=memory`
  - Stripe keys (if needed for production)
  - SMTP config (if needed)

### 4. Force a Clean Redeploy
- Go to Deployments
- Find any previous working deployment
- Click the 3-dot menu → "Redeploy"
- Select "Production" environment

### 5. Check Build Cache Issues
Settings → Advanced → Caching:
- Clear all cache
- Redeploy

## Diagnostic Checklist

- [ ] Homepage loads with brand name visible
- [ ] /catalog returns 200 with product grid
- [ ] /api/products returns 200 with JSON array
- [ ] /checkout is accessible
- [ ] /admin/login is accessible
- [ ] Health check returns 200 or 404 (not 503)

## If Still Failing

Contact Vercel support with:
1. Repository: https://github.com/visuarte/CAMIART
2. Deployment URL: https://camiart.com
3. Latest commits: ad7521d (Restore middleware)
4. Share screenshots of:
   - Vercel build logs
   - Runtime logs
   - Environment variables configuration

## Workarounds

### Option 1: Use Different Hosting
Deploy to Netlify, Railway, or self-hosted to isolate Vercel-specific issues

### Option 2: Test Locally with Production Build
```bash
npm run build
npm run start
# Test http://localhost:3000/catalog
```

### Option 3: Debug Deploy Locally
```bash
# Install Vercel CLI
npm i -g vercel

# Run production build locally
npm run build

# Simulate Vercel production environment
vercel build
vercel start
```

## References
- Next.js 16.2.6 Docs: https://nextjs.org/docs
- Vercel Troubleshooting: https://vercel.com/support
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing

---

**Last Updated**: 2026-05-19  
**Build Status**: 🔴 Deployment failing on production routes  
**MVP Status**: ✅ All functionality working locally
