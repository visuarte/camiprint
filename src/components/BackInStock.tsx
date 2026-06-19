'use client'

import { useState } from 'react'

interface BackInStockProps {
  productId: string
  productName: string
}

export default function BackInStock({ productId, productName }: BackInStockProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email && !phone) { setError('Email o teléfono requerido'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/back-in-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, phone: phone || undefined, productId, productName }),
      })
      if (!res.ok) throw new Error('Error')
      setSent(true)
    } catch {
      setError('Error al registrar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">¡Te avisaremos cuando esté disponible!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Avísame cuando vuelva a estar disponible</p>
      <input
        type="email" placeholder="Tu email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="tel" placeholder="O tu teléfono (WhatsApp)" value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-40"
      >
        {loading ? 'Registrando...' : 'Avísame'}
      </button>
    </form>
  )
}
