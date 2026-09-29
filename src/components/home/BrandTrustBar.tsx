'use client';

export default function BrandTrustBar() {
  const brands = [
    { name: 'Apple', file: '/images/apple.png', height: 'h-10' },
    { name: 'Amazon', file: '/images/amazon.jpg', height: 'h-24' },
    { name: 'Rolex', file: '/images/rolex.png', height: 'h-20' },
    { name: 'Omega', file: '/images/omega.png', height: 'h-20' },
    { name: 'TAG Heuer', file: '/images/tagheuer.png', height: 'h-15' },
    { name: 'Cartier', file: '/images/cartier.svg', height: 'h-7' },
    { name: 'Tissot', file: '/images/tissot.png', height: 'h-15' },
    { name: 'Seiko', file: '/images/seiko.png', height: 'h-30' },
  ];

  return (
    <section className="border-y border-zinc-200/90 bg-white py-2 px-6 select-none">
      <div className="max-w-7xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-zinc-400 text-center block mb-8 font-semibold">
          TOP BRANDS YOU CAN TRUST
        </span>

        {/* 100% Local Vector Logos in Same Uniform Visual Size */}
        <div className="flex flex-wrap items-center justify-between sm:justify-around gap-8 md:gap-12 opacity-85 hover:opacity-100 transition-opacity">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center hover:scale-105 transition-transform duration-300"
              title={brand.name}
            >
              <img
                src={brand.file}
                alt={`${brand.name} official logo`}
                className={`${brand.height} w-auto max-w-80 object-contain text-zinc-900`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}   