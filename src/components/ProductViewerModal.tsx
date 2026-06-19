'use client'

import { useEffect } from 'react'
import ProductViewer3D from '@/components/ProductViewer3D'

interface ProductViewerModalProps {
  open: boolean
  onClose: () => void
  productName: string
  modelSrc?: string
  fallbackImage?: string
}

export default function ProductViewerModal({ open, onClose, productName, modelSrc, fallbackImage }: ProductViewerModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{productName}</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/90 p-2 text-gray-600 shadow-lg transition-colors hover:bg-white hover:text-gray-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ProductViewer3D
          modelSrc={modelSrc}
          fallbackImage={fallbackImage}
          className="h-full w-full"
        />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <p className="whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-xs text-gray-500 shadow-lg backdrop-blur-sm">
            Arrastra para rotar · Rueda para zoom · Toca para girar
          </p>
        </div>
      </div>
    </div>
  )
}
