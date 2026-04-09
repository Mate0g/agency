"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function GlobalHub() {
  // Estado para controlar qué país está activando el fondo global
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Fotografías Icónicas de Alta Disponibilidad (Monumentos Reales)
  const backgrounds: Record<string, string> = {
    brasil: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1920&auto=format&fit=crop", // Cristo Redentor
    chile: "https://www.infobae.com/resizer/v2/RTFZEKNQZNBZRBVUWMKKD3VZNQ?auth=e83c343898d4d9315b0f0a380fb0a98cf19b2b85a4f824dce91e784837ea1c43&smart=true&width=1200&height=675&quality=85", // Santiago / Andes
    argentina: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1920&auto=format&fit=crop", // Obelisco
    china: "https://static.nationalgeographicla.com/files/styles/image_3200/public/nationalgeographic2710344.jpg?w=1600&h=1072", // Gran Muralla
    corea: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1920&auto=format&fit=crop" // Seúl
  };

  return (
    /* h-screen y overflow-hidden para eliminar el scroll en computadoras */
    <div className="h-screen w-full bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden selection:bg-[#C5A059]/30 font-sans">
      
      {/* CAPA DE FONDO GLOBAL (Se activa al pasar el mouse sobre una tarjeta) */}
      <div className="absolute inset-0 z-0">
        {Object.entries(backgrounds).map(([id, url]) => (
          <div 
            key={id}
            className={`absolute inset-0 bg-cover bg-center grayscale transition-all duration-[1200ms] ease-in-out ${
              hoveredCountry === id ? 'opacity-30 scale-100 blur-[3px]' : 'opacity-0 scale-110 blur-[15px]'
            }`}
            style={{ backgroundImage: `url(${url})` }}
          >
            {/* Overlay oscuro para mantener legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80"></div>
          </div>
        ))}
      </div>

      {/* LUZ AMBIENTAL DORADA CENTRAL */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C5A059]/5 rounded-full blur-[200px] pointer-events-none z-1 mix-blend-screen"></div>

      {/* CONTENEDOR DE LA INTERFAZ */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center justify-between h-full py-12 lg:py-16">
        
        {/* HEADER CINEMATOGRÁFICO */}
        <div className="text-center flex flex-col items-center animate-[titleReveal_1.5s_ease-out_forwards]">
          <h1 
            className="text-6xl md:text-8xl lg:text-[8.5rem] font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-b from-[#FFF5D1] via-[#C5A059] to-[#8B6914] leading-none mb-4" 
            style={{ 
              fontFamily: 'Georgia, serif',
              filter: 'drop-shadow(0 0 20px rgba(197, 160, 89, 0.4))'
            }}
          >
            EPM Agency
          </h1>
          
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mb-6"></div>

          <p className="text-slate-300 text-xs md:text-sm lg:text-base font-light tracking-[0.3em] uppercase drop-shadow-lg">
            Descubre el destino de tu <span className="text-[#C5A059] font-bold">futuro profesional</span>
          </p>
        </div>

        {/* GRID DE DESTINOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl items-center relative z-20">
          
          {/* Lado Izquierdo */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <CountryCard 
              country="Brasil" 
              imgUrl="https://flagcdn.com/w160/br.png" 
              href="/brasil" 
              delay="0.8s" 
              onHover={() => setHoveredCountry('brasil')}
              onLeave={() => setHoveredCountry(null)}
            />
            <CountryCard 
              country="Chile" 
              imgUrl="https://flagcdn.com/w160/cl.png" 
              href="/chile" 
              delay="1s" 
              onHover={() => setHoveredCountry('chile')}
              onLeave={() => setHoveredCountry(null)}
            />
          </div>

          {/* Argentina (Protagonista) */}
          <div className="flex flex-col transform md:-translate-y-4">
            <CountryCard 
              country="Argentina" 
              imgUrl="https://flagcdn.com/w160/ar.png" 
              href="/argentina" 
              featured={true} 
              delay="1.2s" 
              onHover={() => setHoveredCountry('argentina')}
              onLeave={() => setHoveredCountry(null)}
            />
          </div>

          {/* Lado Derecho */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <CountryCard 
              country="China" 
              imgUrl="https://flagcdn.com/w160/cn.png" 
              href="/china" 
              delay="1.4s" 
              onHover={() => setHoveredCountry('china')}
              onLeave={() => setHoveredCountry(null)}
            />
            <CountryCard 
              country="Corea" 
              imgUrl="https://flagcdn.com/w160/kr.png" 
              href="/corea" 
              delay="1.6s" 
              onHover={() => setHoveredCountry('corea')}
              onLeave={() => setHoveredCountry(null)}
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] opacity-60">
            EPM Agency 2025 Copyright
          </p>
        </div>
      </div>
      
      {/* ANIMACIONES CSS PERSONALIZADAS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes titleReveal {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes cardReveal {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}

// --- COMPONENTE DE TARJETA DE PAÍS PREMIUM ---
function CountryCard({ 
  country, 
  imgUrl, 
  href, 
  featured = false, 
  delay,
  onHover,
  onLeave
}: { 
  country: string, 
  imgUrl: string, 
  href: string, 
  featured?: boolean, 
  delay: string,
  onHover: () => void,
  onLeave: () => void
}) {
  return (
    <div 
      className="block w-full opacity-0" 
      style={{ animation: `cardReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay} forwards` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Link href={href} className="block w-full h-full outline-none">
        <div className={`
          group relative flex flex-col items-center justify-center rounded-[1.8rem] md:rounded-[2.4rem] 
          border border-white/10 bg-white/[0.04] backdrop-blur-md 
          transition-all duration-500 ease-out cursor-pointer
          hover:-translate-y-2 hover:border-[#C5A059]/40 hover:bg-white/[0.08]
          hover:shadow-[0_25px_50px_-15px_rgba(197,160,89,0.25)]
          ${featured ? 'h-[240px] md:h-[320px] lg:h-[420px] shadow-2xl' : 'h-[180px] md:h-[220px] lg:h-[280px] shadow-lg'}
        `}>
          
          {/* Brillo radial interno en hover */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          {/* Borde dorado inferior expansivo */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] md:h-[3px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent transition-all duration-500 ease-out group-hover:w-2/3 z-10"></div>
          
          {/* Bandera con efecto de relieve */}
          <img 
            src={imgUrl} 
            alt={`Bandera de ${country}`} 
            className={`
              mb-4 md:mb-6 rounded-sm object-cover transform transition-all duration-500 ease-out 
              group-hover:scale-110 group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_20px_rgba(197,160,89,0.5)]
              drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] relative z-10
              ${featured ? 'w-20 md:w-24 lg:w-28' : 'w-14 md:w-16 lg:w-20'}
            `}
          />
          
          {/* Nombre con tipografía elegante */}
          <h2 className={`
            text-white tracking-wide transition-all duration-500 group-hover:text-[#EAB308] group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] relative z-10
            ${featured ? 'text-4xl md:text-5xl lg:text-6xl font-light' : 'text-2xl md:text-3xl lg:text-4xl font-light'}
          `} style={{ fontFamily: 'Georgia, serif' }}>
            {country}
          </h2>
          
          {/* Indicador de exploración */}
          <div className="absolute bottom-5 opacity-0 transform translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 text-[#C5A059] text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] z-10">
            Explorar
          </div>
          
        </div>
      </Link>
    </div>
  );
}