# GitHub Actions Setup - Build & Security Checks

## Overview

Workflows configurados para validar cada push y PR a `main`:

1. **`build-security-checks.yml`** - Full suite (watchdog + build + tests)
2. **`watchdog-quick.yml`** - Fast watchdog-only check

---

## 1️⃣ Full Build & Security Checks (`.github/workflows/build-security-checks.yml`)

Ejecuta automáticamente en **cada push y PR a main**.

### Jobs Incluidos

```yaml
1. security-checks (required)
   ├─ Brand Watchdog Check      (must pass)
   ├─ Vulnerability Scan        (informative)
   └─ Strict Vuln Check         (optional)

2. build (depends on security-checks)
   ├─ Build Project             (Turbopack)
   ├─ TypeScript Check          (optional)
   └─ Run Tests                 (optional)

3. upload-reports
   └─ Upload vulnerability reports as artifacts

4. notify
   └─ Post failure comment on PR (if applicable)
```

### Qué Valida

- ✅ **Watchdog**: No hay violaciones de branding legacy
- ✅ **npm Vulnerabilities**: Reporta estado (no bloquea)
- ✅ **Build**: Compila correctamente
- ✅ **TypeScript**: Sin errores de tipo (opcional)
- ✅ **Tests**: Suite completa pasa (opcional)

### Cuándo Se Ejecuta

```
push to main
├─ run security-checks
├─ run build (if security-checks pass)
└─ upload reports (always)

pull_request to main
├─ run security-checks
├─ run build (if security-checks pass)
├─ upload reports (always)
└─ notify (if build fails)
```

### Outputs

- **✅ Success**: Build + tests pasan, listo para merge
- **❌ Failure**: 
  - Watchdog falló → Arreglar branding
  - Build falló → Revisar logs
  - Tests falló → Fix code
- **⚠️ Warning**: Vulnerabilidades detectadas (informativo)

---

## 2️⃣ Quick Watchdog Check (`.github/workflows/watchdog-quick.yml`)

Ejecuta **solo el watchdog** en cambios de código, muy rápido (~1 min).

### Triggers

```yaml
push to main if changed:
  - src/**
  - scripts/**
  - package.json
  - .github/workflows/watchdog-quick.yml
```

### Uso Típico

Útil para:
- Validación rápida en push directo a main
- Detectar violaciones de branding inmediatamente
- No bloquea deploy (solo alerta)

---

## 🔧 Configuration & Secrets

### Secrets Necesarios (Opcional)

Si quieres que el build corra en CI/CD, configura en GitHub:

```
Settings → Secrets and variables → Actions
```

Secrets requeridos:
- `DATABASE_URL_TEST` - Test database URL (opcional)
- `ADMIN_AUTH_TOKEN_TEST` - Test token (opcional)

Sin estos secrets, el build usará fallbacks (json driver, memory store).

### Environment Variables

El workflow establece automáticamente:

```env
DATABASE_URL = ${{ secrets.DATABASE_URL_TEST }}
ADMIN_AUTH_TOKEN = ${{ secrets.ADMIN_AUTH_TOKEN_TEST }}
QUOTES_REPOSITORY_DRIVER = json
RATE_LIMIT_STORE_DRIVER = memory
NODE_ENV = production
```

---

## 📊 Artifacts & Reports

### Artifact: Vulnerability Reports

En cada ejecución, se guarda:

```
vulnerability-reports/
├─ .vuln-report.json      (último reporte)
└─ .vuln-history.json     (histórico)
```

**Ubicación**: Actions tab → run → Artifacts

**Retención**: 30 días

### Cómo Descargar

```bash
# GitHub CLI
gh run download <run_id> -n vulnerability-reports

# O manualmente desde UI
GitHub → Actions → [latest run] → Artifacts → Download
```

---

## 🎯 Workflow Status

### View Status

```
GitHub → Actions tab → [workflow name]
```

### Per-commit Status

En el commit, verás checks:
- ✅ `build-security-checks / security-checks`
- ✅ `build-security-checks / build`
- ✅ `watchdog-quick` (if applicable)

### PR Status

En el PR, verás:
- ✅ Checks passed = ready to merge
- ❌ Checks failed = fix issues before merge
- ⚠️ Warnings = informative, doesn't block

---

## 🚀 Best Practices

### For Developers

1. **Before pushing**:
   ```bash
   npm run watchdog:brand
   npm run vuln:monitor
   npm run build
   npm test
   ```

2. **On PR feedback**: If watchdog/build fails
   - Read the GitHub Actions logs
   - Fix locally
   - Push again

3. **Monitor vulnerabilities**:
   ```bash
   npm run vuln:history
   ```

### For Maintainers

1. **Review vulnerability reports**
   - Check artifacts in Actions tab monthly
   - Update dependencies if critical vulns appear
   - Update `WATCHDOG_MONITORING_GUIDE.md` if new patterns needed

2. **Update secrets** if credentials rotate:
   - Go to Settings → Secrets
   - Update `DATABASE_URL_TEST`, etc.

3. **Disable strict checks** if needed:
   - Edit `.github/workflows/build-security-checks.yml`
   - Change `continue-on-error: false` to `true`
   - Commit & push

---

## 🔍 Troubleshooting

### Issue: Watchdog fails with "Found legacy brand"

**Solution**: 
- Fix the branding in your code
- Ensure only "cami print" (two words) is marked as legacy
- Official brands "Camiprint" and "CamiArt" are whitelisted

### Issue: Build fails in CI but works locally

**Likely causes**:
- Environment variable missing (DATABASE_URL_TEST, etc.)
- Node version mismatch (CI uses 24.x)
- Cache issue

**Fix**:
```bash
# Replicate CI environment locally
node --version  # should be v24.x
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

### Issue: Artifact reports not generated

**Solution**:
- Vulnerability monitor runs even if build fails
- Check Actions logs for errors
- Manually run: `npm run vuln:monitor`

---

## 📝 Next Steps

1. **Enable branch protection**:
   ```
   GitHub → Settings → Branches → Add rule
   - Require status checks to pass (watchdog + build)
   - Require PR reviews: 1
   ```

2. **Enable auto-merge** (optional):
   ```
   Settings → General → Allow auto-merge
   ```

3. **Monitor runs**:
   - Check Actions tab regularly
   - Review vulnerability reports monthly

4. **Slack integration** (future):
   ```yaml
   - name: Notify Slack
     uses: slackapi/slack-github-action@v1
   ```

---

**Last Updated**: 2026-06-01  
**Workflow Version**: 1.0  
**Node Version**: 24.x
