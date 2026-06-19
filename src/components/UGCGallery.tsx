'use client'

import { useState } from 'react'

const SAMPLE_POSTS = [
  { id: 1, user: '@camiart_cliente', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop', likes: 42 },
  { id: 2, user: '@tuempresa', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', likes: 38 },
  { id: 3, user: '@mimarca', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop', likes: 56 },
  { id: 4, user: '@camisetas_mola', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', likes: 29 },
  { id: 5, user: '@equipo_roll', image: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&h=400&fit=crop', likes: 71 },
  { id: 6, user: '@startup_style', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', likes: 44 },
]

export default function UGCGallery() {
  const [posts] = useState(SAMPLE_POSTS)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-5 md:px-16">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">Clientes reales, resultados reales</h2>
          <p className="mt-3 text-gray-500">
            Comparte tu camiseta con <span className="font-bold text-gray-800">#CamiArt</span> y aparece aquí
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => (
            <a key={post.id}
              href="https://instagram.com"
              target="_blank" rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={post.image}
                alt={`Cliente ${post.user}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div>
                  <p className="text-xs font-semibold text-white">{post.user}</p>
                  <p className="text-[10px] text-white/70">♥ {post.likes}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Síguenos en Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
