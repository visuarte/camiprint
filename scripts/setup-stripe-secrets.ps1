#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Sube claves de Stripe a Vercel como variables de entorno (production + preview).

.DESCRIPTION
  - Añade/actualiza `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y opcional `STRIPE_PUBLISHABLE_KEY`
    en el proyecto Vercel indicado usando la API REST y el `VERCEL_TOKEN` del operador.
  - No guarda nada en la base de datos local.

.EXAMPLE
  .\scripts\setup-stripe-secrets.ps1 `
    -VercelToken "your_token" `
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
  [string]$StripePublishableKey = "",
  [string]$VercelTeamId = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$vercelApiBase = "https://api.vercel.com"
$headers = @{ Authorization = "Bearer $VercelToken"; "Content-Type" = "application/json" }

function Invoke-Vercel { param([string]$Method, [string]$Path, [hashtable]$Body = $null)
  $uri = "$vercelApiBase$Path"
  if ($VercelTeamId) { $uri += "?teamId=$VercelTeamId" }
  $params = @{ Method = $Method; Uri = $uri; Headers = $headers }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
  return Invoke-RestMethod @params
}

Write-Host "🔍 Verificando proyecto Vercel..."
try { $project = Invoke-Vercel -Method GET -Path "/v9/projects/$VercelProjectId"; Write-Host "✅ Proyecto: $($project.name)" } catch { Write-Error "No se pudo acceder al proyecto. Verifica VercelToken y VercelProjectId.`n$_"; exit 1 }

$envPath = "/v9/projects/$VercelProjectId/env"
$vars = @(
  @{ key = 'STRIPE_SECRET_KEY'; value = $StripeSecretKey; type = 'encrypted' },
  @{ key = 'STRIPE_WEBHOOK_SECRET'; value = $StripeWebhookSecret; type = 'encrypted' }
)
if ($StripePublishableKey) { $vars += @{ key = 'STRIPE_PUBLISHABLE_KEY'; value = $StripePublishableKey; type = 'plain' } }

$targets = @('production','preview')
foreach ($target in $targets) {
  foreach ($v in $vars) {
    $body = @{ key = $v.key; value = $v.value; type = $v.type; target = @($target) }
    try {
      Invoke-Vercel -Method POST -Path $envPath -Body $body | Out-Null
      Write-Host "  ✅ Creada: $($v.key) for $target"
    } catch {
      # try update
      $envVars = Invoke-Vercel -Method GET -Path $envPath
      $existing = $envVars.envs | Where-Object { $_.key -eq $v.key -and $_.target -contains $target }
      if ($existing) {
        Invoke-Vercel -Method PATCH -Path "$envPath/$($existing[0].id)" -Body $body | Out-Null
        Write-Host "  ✅ Actualizada: $($v.key) for $target"
      } else {
        Write-Warning "No se pudo crear/actualizar $($v.key) for $target: $_"
      }
    }
  }
}

Write-Host "🎉 Variables Stripe configuradas en Vercel (production + preview)."
Write-Host "Nota: STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET se guardan como 'encrypted'."
