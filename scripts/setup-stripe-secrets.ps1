#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Sube claves de Stripe a Vercel como variables de entorno (production + preview).

.DESCRIPTION
  Anade/actualiza STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET y opcional STRIPE_PUBLISHABLE_KEY
  en el proyecto Vercel indicado usando la API REST.

.EXAMPLE
  .\scripts\setup-stripe-secrets.ps1 `
    -VercelToken "vcp_xxx" `
    -VercelProjectId "prj_xxx" `
    -StripeSecretKey "sk_live_..." `
    -StripeWebhookSecret "whsec_..." `
    -StripePublishableKey "pk_live_..."
#>

param(
  [Parameter(Mandatory)] [string]$VercelToken,
  [Parameter(Mandatory)] [string]$VercelProjectId,
  [Parameter(Mandatory)] [string]$StripeSecretKey,
  [Parameter(Mandatory)] [string]$StripeWebhookSecret,
  [string]$StripePublishableKey = '',
  [string]$VercelTeamId = '',
  [Alias('WhatIf')] [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($VercelToken -match '^(sk_|pk_|we_)') {
  Write-Error 'El token parece ser de Stripe. Usa un Personal Token de Vercel desde https://vercel.com/account/tokens'
  exit 1
}

$vercelApiBase = 'https://api.vercel.com'
$headers = @{
  Authorization  = "Bearer $VercelToken"
  'Content-Type' = 'application/json'
}

function Invoke-Vercel {
  param([string]$Method, [string]$Path, [hashtable]$Body = $null)
  $uri = "$vercelApiBase$Path"
  if ($VercelTeamId) { $uri += "?teamId=$VercelTeamId" }
  if ($DryRun) {
    $bodyJson = if ($Body) { $Body | ConvertTo-Json -Compress } else { '' }
    Write-Host "[DRY-RUN] $Method $uri"
    if ($bodyJson) { Write-Host "[DRY-RUN] Body: $bodyJson" }
    return [PSCustomObject]@{ dryrun = $true }
  }
  $params = @{ Method = $Method; Uri = $uri; Headers = $headers }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
  return Invoke-RestMethod @params
}

Write-Host '[*] Verificando proyecto Vercel...'
if ($DryRun) {
  Write-Host '[DRY-RUN] GET https://api.vercel.com/v9/projects/' + $VercelProjectId + ' (skipped)'
  Write-Host '[DRY-RUN] Modo simulacion activo — no se modificara nada en Vercel.'
} else {
  try {
    $projectInfo = Invoke-Vercel -Method GET -Path "/v9/projects/$VercelProjectId"
    Write-Host ('[OK] Proyecto: ' + $projectInfo.name)
  } catch {
    Write-Error ('No se pudo acceder al proyecto. Verifica VercelToken y VercelProjectId. ' + $_.ToString())
    exit 1
  }
}

$envPath = "/v9/projects/$VercelProjectId/env"
$vars = @(
  @{ key = 'STRIPE_SECRET_KEY';      value = $StripeSecretKey;      type = 'encrypted' },
  @{ key = 'STRIPE_WEBHOOK_SECRET';  value = $StripeWebhookSecret;  type = 'encrypted' }
)
if ($StripePublishableKey) {
  $vars += @{ key = 'STRIPE_PUBLISHABLE_KEY'; value = $StripePublishableKey; type = 'plain' }
}

$targets = @('production', 'preview')
foreach ($target in $targets) {
  foreach ($v in $vars) {
    $body = @{ key = $v['key']; value = $v['value']; type = $v['type']; target = @($target) }
    try {
      Invoke-Vercel -Method POST -Path $envPath -Body $body | Out-Null
      Write-Host ('[OK] Creada: ' + $v['key'] + ' [' + $target + ']')
    } catch {
      $envVars = Invoke-Vercel -Method GET -Path $envPath
      $existing = $envVars.envs | Where-Object { $_.key -eq $v['key'] -and $_.target -contains $target }
      if ($existing) {
        # No incluir 'type' en el PATCH: Vercel no permite cambiar el tipo de variables sensitive
        $patchBody = @{ value = $v['value']; target = @($target) }
        Invoke-Vercel -Method PATCH -Path ($envPath + '/' + $existing[0].id) -Body $patchBody | Out-Null
        Write-Host ('[OK] Actualizada: ' + $v['key'] + ' [' + $target + ']')
      } else {
        Write-Warning ('No se pudo crear/actualizar ' + $v['key'] + ' for ' + $target + ': ' + $_.ToString())
      }
    }
  }
}

Write-Host '[DONE] Variables Stripe configuradas en Vercel (production + preview).'
Write-Host '[INFO] STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET guardadas como encrypted.'
