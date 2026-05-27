#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Configura SUPABASE_CA_CERT en Vercel y elimina NODE_TLS_REJECT_UNAUTHORIZED.

.DESCRIPTION
  1. Lee el CA cert de Supabase (prod-ca-2021.crt).
  2. Lo codifica en base64.
  3. Lo sube a Vercel via API REST usando VERCEL_TOKEN.
  4. Elimina NODE_TLS_REJECT_UNAUTHORIZED de Vercel.
  5. Dispara un redeploy del último deployment de producción.

.HOW TO GET SUPABASE CERT
  Supabase Dashboard → tu proyecto → Settings → Database
  → sección "SSL Certificate" → botón "Download certificate"
  Guarda el archivo como: prod-ca-2021.crt (en cualquier carpeta)

.HOW TO GET VERCEL TOKEN
  https://vercel.com/account/tokens → New Token → copia el valor

.EXAMPLE
  .\scripts\setup-supabase-tls.ps1 `
    -CertPath "C:\Users\DIEGO\Downloads\prod-ca-2021.crt" `
    -VercelToken "your_vercel_token_here" `
    -VercelProjectId "prj_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" `
    -VercelTeamId ""

.HOW TO GET VERCEL PROJECT ID
  Vercel Dashboard → tu proyecto → Settings → General → Project ID
#>

param(
  [Parameter(Mandatory)]
  [string]$CertPath,

  [Parameter(Mandatory)]
  [string]$VercelToken,

  [Parameter(Mandatory)]
  [string]$VercelProjectId,

  [string]$VercelTeamId = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── 1. Leer y encodear el cert ────────────────────────────────────────────

if (-not (Test-Path $CertPath)) {
  Write-Error "No se encontró el archivo: $CertPath"
  exit 1
}

$certBytes = [IO.File]::ReadAllBytes($CertPath)
$certBase64 = [Convert]::ToBase64String($certBytes)
Write-Host "✅ CA cert leído: $($certBytes.Length) bytes → base64 ($($certBase64.Length) chars)"

# ─── 2. Helper para llamadas a Vercel API ──────────────────────────────────

$vercelApiBase = "https://api.vercel.com"
$headers = @{
  Authorization  = "Bearer $VercelToken"
  "Content-Type" = "application/json"
}

function Invoke-Vercel {
  param([string]$Method, [string]$Path, [hashtable]$Body = $null)

  $uri = "$vercelApiBase$Path"
  if ($VercelTeamId) { $uri += "?teamId=$VercelTeamId" }

  $params = @{ Method = $Method; Uri = $uri; Headers = $headers }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }

  return Invoke-RestMethod @params
}

# ─── 3. Verificar que el proyecto existe ───────────────────────────────────

Write-Host "🔍 Verificando proyecto Vercel..."
try {
  $project = Invoke-Vercel -Method GET -Path "/v9/projects/$VercelProjectId"
  Write-Host "✅ Proyecto: $($project.name)"
} catch {
  Write-Error "No se pudo acceder al proyecto. Verifica VercelToken y VercelProjectId.`n$_"
  exit 1
}

# ─── 4. Eliminar NODE_TLS_REJECT_UNAUTHORIZED (si existe) ──────────────────

Write-Host "🗑  Eliminando NODE_TLS_REJECT_UNAUTHORIZED..."
$envPath = "/v9/projects/$VercelProjectId/env"
try {
  $envVars = Invoke-Vercel -Method GET -Path $envPath
  $tlsVar = $envVars.envs | Where-Object { $_.key -eq "NODE_TLS_REJECT_UNAUTHORIZED" }
  if ($tlsVar) {
    foreach ($env in @($tlsVar)) {
      Invoke-Vercel -Method DELETE -Path "$envPath/$($env.id)" | Out-Null
      Write-Host "  ✅ Eliminada (id=$($env.id), target=$($env.target -join ','))"
    }
  } else {
    Write-Host "  ℹ️  NODE_TLS_REJECT_UNAUTHORIZED no estaba configurada."
  }
} catch {
  Write-Warning "No se pudo eliminar NODE_TLS_REJECT_UNAUTHORIZED: $_"
}

# ─── 5. Añadir o actualizar SUPABASE_CA_CERT ───────────────────────────────

Write-Host "🔑 Configurando SUPABASE_CA_CERT en Vercel..."

$targets = @("production", "preview")  # excluye 'development' a propósito

foreach ($target in $targets) {
  $body = @{
    key    = "SUPABASE_CA_CERT"
    value  = $certBase64
    type   = "encrypted"
    target = @($target)
  }
  try {
    Invoke-Vercel -Method POST -Path $envPath -Body $body | Out-Null
    Write-Host "  ✅ Creada para: $target"
  } catch {
    # Ya existe — intentar actualizar buscando el ID
    $envVars = Invoke-Vercel -Method GET -Path $envPath
    $existing = $envVars.envs | Where-Object { $_.key -eq "SUPABASE_CA_CERT" -and $_.target -contains $target }
    if ($existing) {
      Invoke-Vercel -Method PATCH -Path "$envPath/$($existing[0].id)" -Body $body | Out-Null
      Write-Host "  ✅ Actualizada para: $target"
    } else {
      Write-Warning "No se pudo crear/actualizar para $target : $_"
    }
  }
}

# ─── 6. Disparar redeploy ──────────────────────────────────────────────────

Write-Host "🚀 Iniciando redeploy de producción..."
try {
  $deployments = Invoke-Vercel -Method GET -Path "/v6/deployments?projectId=$VercelProjectId&target=production&limit=1"
  $lastDeploy = $deployments.deployments[0]

  $redeployBody = @{
    deploymentId = $lastDeploy.uid
    name         = $project.name
    target       = "production"
  }
  $newDeploy = Invoke-Vercel -Method POST -Path "/v13/deployments" -Body $redeployBody
  Write-Host "  ✅ Redeploy iniciado: $($newDeploy.url)"
} catch {
  Write-Warning "Redeploy automático falló. Haz un redeploy manual desde el dashboard.`n$_"
}

Write-Host ""
Write-Host "🎉 Configuración TLS completada."
Write-Host "   SUPABASE_CA_CERT = configurada (production + preview)"
Write-Host "   NODE_TLS_REJECT_UNAUTHORIZED = eliminada"
