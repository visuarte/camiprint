'use client'

import { useState } from 'react'

type BodyType = 'delgado' | 'normal' | 'musculoso' | 'robusto'

interface SizeTable {
  [key: string]: { chest: string; length: string; weight: string }
}

const SIZE_CHART: SizeTable = {
  XS: { chest: '86-91', length: '66-68', weight: '50-60' },
  S: { chest: '91-96', length: '68-71', weight: '60-72' },
  M: { chest: '96-101', length: '71-74', weight: '72-84' },
  L: { chest: '101-106', length: '74-77', weight: '84-96' },
  XL: { chest: '106-111', length: '77-79', weight: '96-108' },
  '2XL': { chest: '111-116', length: '79-81', weight: '108-120' },
  '3XL': { chest: '116-121', length: '81-83', weight: '120-132' },
}

const BODY_TYPE_ADJUSTMENT: Record<BodyType, number> = {
  delgado: -1,
  normal: 0,
  musculoso: 0,
  robusto: 1,
}

function calculateRecommendedSize(height: number, weight: number, bodyType: BodyType): string {
  const bmi = weight / ((height / 100) * (height / 100))
  let baseSize: string

  if (bmi < 18.5) baseSize = 'XS'
  else if (bmi < 22) baseSize = 'S'
  else if (bmi < 25) baseSize = 'M'
  else if (bmi < 28) baseSize = 'L'
  else if (bmi < 31) baseSize = 'XL'
  else if (bmi < 34) baseSize = '2XL'
  else baseSize = '3XL'

  const sizes = Object.keys(SIZE_CHART)
  let index = sizes.indexOf(baseSize)
  index = Math.max(0, Math.min(sizes.length - 1, index + BODY_TYPE_ADJUSTMENT[bodyType]))

  return sizes[index]
}

export default function SizeRecommender() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyType, setBodyType] = useState<BodyType>('normal')
  const [result, setResult] = useState<string | null>(null)
  const [showChart, setShowChart] = useState(false)

  const handleCalculate = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w || h < 100 || h > 250 || w < 30 || w > 200) return
    const size = calculateRecommendedSize(h, w, bodyType)
    setResult(size)
  }

  const isValid = height && weight && parseFloat(height) >= 100 && parseFloat(height) <= 250 && parseFloat(weight) >= 30 && parseFloat(weight) <= 200

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">¿Qué talla soy?</h3>
      <p className="mt-1 text-sm text-gray-500">Introduce tus medidas y te recomendamos la talla exacta</p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Altura (cm)</label>
          <input
            type="number" placeholder="Ej: 175" value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Peso (kg)</label>
          <input
            type="number" placeholder="Ej: 72" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Tipo de cuerpo</label>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {(['delgado', 'normal', 'musculoso', 'robusto'] as BodyType[]).map((type) => (
            <button key={type}
              onClick={() => setBodyType(type)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                bodyType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={!isValid}
        className="mt-5 w-full rounded-lg bg-gray-900 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Calcular mi talla
      </button>

      {result && (
        <div className="mt-5 rounded-xl border-2 border-blue-100 bg-blue-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Talla recomendada</p>
          <p className="mt-1 text-4xl font-bold text-blue-700">{result}</p>
          {SIZE_CHART[result] && (
            <p className="mt-2 text-xs text-blue-500">
              Pecho: {SIZE_CHART[result].chest} cm · Largo: {SIZE_CHART[result].length} cm
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setShowChart(!showChart)}
        className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600"
      >
        {showChart ? 'Ocultar' : 'Ver'} tabla de tallas
      </button>

      {showChart && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-3 font-semibold text-gray-600">Talla</th>
                <th className="py-2 pr-3 font-semibold text-gray-600">Pecho (cm)</th>
                <th className="py-2 pr-3 font-semibold text-gray-600">Largo (cm)</th>
                <th className="py-2 font-semibold text-gray-600">Peso ref. (kg)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SIZE_CHART).map(([size, measures]) => (
                <tr key={size} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-medium text-gray-800">{size}</td>
                  <td className="py-2 pr-3 text-gray-500">{measures.chest}</td>
                  <td className="py-2 pr-3 text-gray-500">{measures.length}</td>
                  <td className="py-2 text-gray-500">{measures.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
