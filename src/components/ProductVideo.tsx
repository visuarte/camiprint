'use client'

import { useState, useRef } from 'react'

interface ProductVideoProps {
  videoSrc?: string
  posterImage?: string
  productName: string
}

export default function ProductVideo({ videoSrc, posterImage, productName }: ProductVideoProps) {
  const [open, setOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!videoSrc) return null

  const handleOpen = () => {
    setOpen(true)
    setTimeout(() => videoRef.current?.play(), 300)
  }

  const handleClose = () => {
    videoRef.current?.pause()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
          <svg className="ml-0.5 h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span>Ver vídeo del producto</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleClose}>
          <div
            className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-4">
              <h3 className="text-sm font-semibold text-white/90">{productName}</h3>
              <button onClick={handleClose} className="rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterImage}
              controls
              className="w-full aspect-video"
              playsInline
            >
              Tu navegador no soporta video.
            </video>
          </div>
        </div>
      )}
    </>
  )
}
