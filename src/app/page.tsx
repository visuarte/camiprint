export default function Home() {
  const ofertas = [
    { cantidad: "10+ camisetas", precio: "12,90 € / unidad", ahorro: "Ahorra 8%" },
    { cantidad: "25+ camisetas", precio: "10,90 € / unidad", ahorro: "Ahorra 18%" },
    { cantidad: "50+ camisetas", precio: "8,90 € / unidad", ahorro: "Ahorra 30%" },
  ];

  const categorias = [
    "Uniformes para hostelería y restauración",
    "Camisetas promocionales para campañas",
    "Ropa laboral para equipos de empresa",
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 md:px-10">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 p-8 text-white shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-200">
          Camiprint · Venta rápida online
        </p>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Camisetas personalizadas para negocios, restaurantes y empresas
        </h1>
        <p className="max-w-2xl text-blue-100">
          Diseñadas para ropa laboral y campañas de publicidad. Configura tu pedido y recibe una propuesta en minutos.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Ofertas rápidas por cantidad</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ofertas.map((oferta) => (
            <article key={oferta.cantidad} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{oferta.cantidad}</p>
              <p className="my-2 text-2xl font-bold text-slate-900">{oferta.precio}</p>
              <p className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {oferta.ahorro}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-2xl font-semibold">Especialistas en</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          {categorias.map((categoria) => (
            <li key={categoria}>{categoria}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
