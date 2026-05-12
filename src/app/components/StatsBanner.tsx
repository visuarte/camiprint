const stats = [
  { label: 'Ordenes', value: '120k+' },
  { label: 'Clientes', value: '8.5k+' },
  { label: 'Productos', value: '200+' },
];

const StatsBanner = () => {
  return (
    <section className="relative z-10 px-4 pb-12 md:px-6 md:pb-14">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-cami-950/80 px-4 py-6 backdrop-blur-md md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-5 text-center md:grid-cols-3 md:gap-8">
          {stats.map((stat) => (
            <article key={stat.label}>
              <p className="text-sm uppercase tracking-wider text-cami-300 md:text-base">{stat.label}</p>
              <p className="mt-1 text-5xl font-bold leading-none text-white md:text-6xl">{stat.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
