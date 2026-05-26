# ============================================================
# push-env-to-vercel.ps1
# Sube todas las variables de .env a Vercel via API REST
# Uso: .\scripts\push-env-to-vercel.ps1 -Token tu_token_vercel
# Token: https://vercel.com/account/tokens -> Create Token
# ============================================================

param(
    [string]$EnvFile = ".env",
    [string]$Environment = "production",
    [string]$Token = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$PROJECT_ID = "prj_YNaj57OHymKfMru2gtGFF4Dlc1EE"
$TEAM_ID    = "team_Lvf2lKQUmTRLQjaEIz6qnZa7"

$SKIP_KEYS = @(
    "REDIS_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS"
)

if (-not (Test-Path $EnvFile)) { Write-Error "No se encontro: $EnvFile"; exit 1 }

if (-not $DryRun -and -not $Token) {
    Write-Host ""
    Write-Host "ERROR: Falta -Token. Crea uno en: https://vercel.com/account/tokens" -ForegroundColor Red
    Write-Host "Uso: .\scripts\push-env-to-vercel.ps1 -Token TU_TOKEN" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Push .env -> Vercel API ($Environment)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
if ($DryRun) { Write-Host "[DRY RUN]" -ForegroundColor Yellow }
Write-Host ""

$batch   = @()
$seen    = @{}
$skipped = 0

foreach ($line in (Get-Content $EnvFile)) {
    if ($line -match '^\s*$' -or $line -match '^\s*#') { continue }
    if ($line -notmatch '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') { continue }

    $key   = $Matches[1]
    $value = $Matches[2].Trim('"').Trim("'")

    if ($seen.ContainsKey($key)) {
        Write-Host "  [SKIP-DUP] $key" -ForegroundColor DarkGray
        $skipped++; continue
    }
    $seen[$key] = $true

    if ($SKIP_KEYS -contains $key) {
        Write-Host "  [SKIP]     $key" -ForegroundColor DarkGray
        $skipped++; continue
    }

    $display = if ($value.Length -gt 8) { $value.Substring(0,4) + "****" } else { "****" }
    Write-Host "  [ADD]      $key = $display" -ForegroundColor Green

    $type = if ($key -like "NEXT_PUBLIC_*") { "plain" } else { "encrypted" }
    $batch += @{ key = $key; value = $value; type = $type; target = @($Environment) }
}

Write-Host ""

if ($DryRun) {
    Write-Host "  Total a subir : $($batch.Count)" -ForegroundColor Green
    Write-Host "  Saltadas      : $skipped" -ForegroundColor DarkGray
    exit 0
}

$url     = "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID&upsert=true"
$headers = @{ Authorization = "Bearer $Token"; "Content-Type" = "application/json" }
$body    = $batch | ConvertTo-Json -Depth 5

Write-Host "Subiendo $($batch.Count) variables a Vercel..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    $count = if ($response -is [array]) { $response.Count } else { 1 }
    Write-Host ""
    Write-Host "  OK: $count variables subidas" -ForegroundColor Green
    Write-Host "  Saltadas: $skipped" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Redesplegando..." -ForegroundColor Yellow
    npx vercel deploy --prod --yes 2>&1 | Select-Object -Last 5
    Write-Host ""
    Write-Host "Listo! https://vercel.com/visuarte/camiprint/settings/environment-variables" -ForegroundColor Green
} catch {
    Write-Host "ERROR API Vercel: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
    exit 1
}
