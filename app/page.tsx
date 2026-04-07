"use client";
import { useState, useRef } from 'react';
import { supabase } from './supabaseClient'; 
import { 
  Search, CheckCircle2, Clock, AlertCircle, Globe, 
  GraduationCap, Stethoscope, BookOpen, MessageCircle, 
  ArrowRight, Menu, Star, Quote, ChevronDown, ShieldCheck, Loader2,
  Upload, FileText, Check, Mail
} from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados para la carga de archivos del cliente
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(false);
    setResult(null);
    setUploadSuccess(false);

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', query.trim())
      .single();

    if (error || !data) {
      setError(true);
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  // Función para que el cliente suba archivos
  const handleClientUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !result) return;
    setUploading(true);
    setUploadSuccess(false);
    
    const file = e.target.files[0];
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${result.id}/cliente_${Date.now()}_${cleanName}`;

    const { error: uploadError } = await supabase.storage.from('expedientes').upload(filePath, file);

    if (uploadError) {
      alert("Error al subir el archivo. Intenta nuevamente.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('expedientes').getPublicUrl(filePath);

    const newFileObj = {
      name: `[CLIENTE] ${file.name}`,
      url: publicUrl,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString()
    };

    const updatedFiles = [...(result.archivos || []), newFileObj];
    
    const { error: updateError } = await supabase
      .from('clientes')
      .update({ archivos: updatedFiles })
      .eq('id', result.id);

    if (!updateError) {
      setResult({ ...result, archivos: updatedFiles });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-[#C5A059]/30 scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-gray-100 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
          
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-12 h-12 bg-[#0A192F] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Globe size={28} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black text-[#0A192F] leading-none uppercase tracking-tighter italic">EPM</span>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.35em]">Agency</span>
            </div>
          </div>

          <div className="hidden md:flex gap-12 text-xs font-black uppercase tracking-widest text-slate-400 items-center">
            <a href="#inicio" className="hover:text-[#0A192F] hover:scale-105 transition-all">Inicio</a>
            <a href="#servicios" className="hover:text-[#0A192F] hover:scale-105 transition-all">Servicios</a>
            <a href="#testimonios" className="hover:text-[#0A192F] hover:scale-105 transition-all">Testimonios</a>
            <a href="#seguimiento" className="bg-[#0A192F] text-white px-8 py-4 rounded-full hover:bg-[#C5A059] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Seguimiento
            </a>
          </div>

          <button className="md:hidden text-[#0A192F] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={32} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 shadow-xl animate-fade-in">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="text-[#0A192F] font-bold text-lg">Inicio</a>
            <a href="#servicios" onClick={() => setMobileMenuOpen(false)} className="text-[#0A192F] font-bold text-lg">Servicios</a>
            <a href="#testimonios" onClick={() => setMobileMenuOpen(false)} className="text-[#0A192F] font-bold text-lg">Testimonios</a>
            <a href="#seguimiento" onClick={() => setMobileMenuOpen(false)} className="text-[#C5A059] font-bold text-lg">Seguimiento</a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="inicio" className="pt-48 pb-32 px-6 flex flex-col items-center text-center max-w-6xl mx-auto min-h-screen justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 border border-blue-100 mb-10 animate-fade-in shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A192F] animate-pulse"></span>
          <span className="text-[#0A192F] text-xs font-black uppercase tracking-widest">Líderes en Consultoría Educativa</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-[#0A192F] mb-10 leading-[0.95] tracking-tight">
          Tu futuro profesional en <br className="hidden md:block" />
          <span className="text-[#C5A059] relative inline-block">
            Argentina.
            <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#C5A059]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        
        <p className="text-slate-500 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed italic mb-14">
          Hacemos realidad tu sueño de especializarte. <br className="hidden md:block"/>
          Gestión de DNI, Convalidaciones y Cupos Universitarios.
        </p>
        
        <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto px-4">
          <a href="#servicios" className="bg-[#0A192F] text-white px-10 py-5 md:px-12 md:py-6 rounded-full font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-900/30 uppercase text-xs md:text-sm tracking-widest flex items-center justify-center gap-3">
            Ver Servicios <ArrowRight size={18} />
          </a>
          <a 
            href="https://wa.me/593994287462?text=Hola%20EPM%20Agency,%20me%20interesa%20recibir%20m%C3%A1s%20informaci%C3%B3n."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#0A192F] border-2 border-slate-100 px-10 py-5 md:px-12 md:py-6 rounded-full font-bold hover:border-[#0A192F] hover:bg-slate-50 transition-all uppercase text-xs md:text-sm tracking-widest flex items-center justify-center gap-2"
          >
            Más Información <MessageCircle size={18} />
          </a>
        </div>
        
        <a href="#servicios" className="mt-20 animate-bounce text-slate-300 hidden md:block">
          <ChevronDown size={32} />
        </a>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-24 md:py-32 bg-slate-50/80 rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-10 mb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-6xl font-black text-[#0A192F] mb-6">Nuestros Servicios</h2>
            <div className="w-24 h-2 bg-[#C5A059] mx-auto rounded-full"></div>
            <p className="mt-6 text-slate-500 text-lg max-w-3xl mx-auto">
              Te acompañamos en todo el proceso migratorio y académico, asegurando tu ingreso tanto a universidades públicas como privadas de prestigio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* SERVICIO 1 */}
            <ServiceCard 
              icon={<GraduationCap size={40} />}
              title="Grado Universitario (UBA y Privadas)"
              description="Asegura tu ingreso a la Universidad de Buenos Aires (UBA - CBC/UBA XXI) o a las mejores Universidades Privadas (Barceló, UAI, Austral, etc.). Incluye legalización de título bachiller, trámite de DNI temporario, búsqueda de vivienda segura y asesoría pre-partida."
              whatsappMessage="Hola EPM, me interesa estudiar una carrera de Grado (Medicina/Otros) en la UBA o Privada."
            />
            
            {/* SERVICIO 2 - DESTACADO */}
            <div className="relative transform md:-translate-y-4">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#C5A059] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full z-10 shadow-lg whitespace-nowrap">
                Más Solicitado
              </div>
              <ServiceCard 
                icon={<Stethoscope size={40} />}
                title="Especialidades en el Área de la Salud"
                description="Convalidación de Título Profesional (Medicina, Odontología, Enfermería, etc.) ante los Ministerios de Educación y Salud. Asesoría integral para Residencias, Concurrencias y Especializaciones universitarias."
                highlighted={true}
                whatsappMessage="Hola EPM, soy profesional de la salud y quiero información sobre Convalidación y Especialidades."
              />
            </div>

            {/* SERVICIO 3 */}
            <ServiceCard 
              icon={<BookOpen size={40} />}
              title="Maestrías y Posgrados"
              description="Potencia tu carrera con programas de cuarto nivel: Doctorados, Maestrías y Diplomaturas en las instituciones más prestigiosas de Argentina. Te guiamos en la inscripción universitaria, apostillado de documentos y renovación de residencia precaria."
              whatsappMessage="Hola EPM, busco información sobre Maestrías y Posgrados en Argentina."
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIOS SECTION */}
      <section id="testimonios" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 text-[#C5A059] mb-4 font-bold uppercase tracking-widest text-xs">
            <Star size={16} fill="#C5A059" /> Historias de Éxito
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0A192F]">Ellos confiaron en EPM</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard 
            name="Dra. María Belén" 
            role="Residente de Pediatría"
            text="Gracias a EPM pude convalidar mi título en tiempo récord. El equipo se encargó de todo el papeleo en Buenos Aires mientras yo terminaba mi rural."
          />
          <TestimonialCard 
            name="Dr. Juan Carlos" 
            role="Especialidad en Cardiología"
            text="La asesoría fue impecable. Desde el DNI hasta la inscripción en la UBA. Hoy ya estoy cursando mi primer año de la especialidad."
          />
          <TestimonialCard 
            name="Lic. Sofía Andrade" 
            role="Maestría en Salud Pública"
            text="Tenía miedo de los trámites migratorios, pero EPM Agency me dio una seguridad increíble. Siempre responden rápido y con información clara."
          />
        </div>
      </section>

      {/* SEGUIMIENTO SECTION */}
      <section id="seguimiento" className="py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-[0_40px_80px_-20px_rgba(10,25,47,0.15)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 justify-center mb-4 text-[#C5A059]">
              <Search size={24} />
              <span className="text-sm font-black uppercase tracking-widest">Área de Clientes</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#0A192F]">Estado de tu Trámite</h2>
            <p className="text-slate-500 mt-4">Ingresa tu documento para ver el avance en tiempo real.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-16 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-xl max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder="Cédula o Pasaporte" 
              className="flex-1 px-8 py-4 bg-transparent outline-none text-lg font-semibold text-[#0A192F] placeholder:text-slate-300 w-full"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch} 
              className="bg-[#0A192F] text-white px-10 py-4 rounded-[1.5rem] font-bold hover:bg-[#C5A059] transition-colors uppercase text-xs tracking-widest w-full md:w-auto shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Consultar'}
            </button>
          </div>

          {result && (
            <div className="animate-fade-in space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-slate-50 pb-8 gap-6">
                <div className="text-left w-full">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Titular del Expediente</p>
                  <h3 className="text-2xl md:text-4xl font-black text-[#0A192F] uppercase italic tracking-tight">{result.nombre}</h3>
                </div>
                <div className="bg-blue-50 px-6 py-4 rounded-2xl w-full md:w-auto text-center md:text-right">
                  <span className="text-[#0A192F] font-bold text-sm block md:inline mr-2">Progreso: </span>
                  <span className="text-[#0A192F] font-black text-3xl">{result.progreso}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard label="DNI Argentino" value={result.dni} />
                <StatusCard label="Convalidación" value={result.convalidacion} />
                <StatusCard label="Documentación" value={result.documentacion} />
              </div>

              {/* ZONA DE CARGA PARA EL CLIENTE */}
              {(result.documentacion?.toLowerCase().includes("incompleta") || result.documentacion?.toLowerCase().includes("revisión") || result.documentacion?.toLowerCase().includes("revision")) && (
                <div className="bg-[#C5A059]/10 border-2 border-dashed border-[#C5A059]/40 rounded-[2rem] p-8 text-center relative animate-fade-in mt-6">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C5A059] shadow-sm mb-2"><Upload size={24}/></div>
                        <h4 className="text-[#0A192F] font-black text-lg">Acción Requerida: Sube tus documentos</h4>
                        <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">Tu asesor ha solicitado que adjuntes documentación. Selecciona y sube tus PDFs o imágenes aquí.</p>
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleClientUpload} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-[#0A192F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#C5A059] transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
                           {uploading ? <Loader2 className="animate-spin" size={16}/> : <FileText size={16}/>} 
                           {uploading ? 'Procesando...' : 'Seleccionar Archivo'}
                        </button>
                        
                        {uploadSuccess && <div className="mt-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in"><Check size={14}/> Archivo enviado correctamente al asesor.</div>}
                    </div>
                </div>
              )}

              <div className="bg-[#0A192F] p-10 rounded-[2.5rem] text-white relative overflow-hidden group text-left shadow-2xl">
                <div className="relative z-10">
                  <p className="text-[#C5A059] text-[10px] font-black uppercase tracking-widest mb-4">Observaciones del Asesor</p>
                  <p className="text-lg md:text-xl font-medium italic opacity-90 leading-relaxed indent-8">"{result.observaciones}"</p>
                </div>
                <ShieldCheck className="absolute -bottom-6 -right-6 text-white/5 group-hover:rotate-12 transition-transform duration-700" size={180} />
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div className="bg-red-50 p-4 rounded-full mb-4 text-red-500">
                <AlertCircle size={32}/>
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">Documento no encontrado</h3>
              <p className="text-slate-400 text-sm">Por favor verifica el número o contacta a soporte.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- SECCIÓN 5: CONTACTO Y FOOTER --- */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
            
            {/* 1. Marca y Descripción */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#0A192F] rounded-2xl flex items-center justify-center text-white shadow-lg"><Globe size={24} /></div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-black text-[#0A192F] leading-none uppercase tracking-tighter italic">EPM</span>
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">Agency</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                Especialistas en gestión académica, legal y migratoria para estudiantes y profesionales de la salud en Argentina.
              </p>
            </div>

            {/* 2. Líneas de Atención (Banderas) */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-[#0A192F] font-black uppercase tracking-widest text-xs mb-6">Líneas de Atención</h4>
              <div className="space-y-4">
                <a href="https://wa.me/5491128519225" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#C5A059] transition-colors font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl w-fit">
                  <span className="text-2xl">🇦🇷</span> +54 9 11 2851-9225 (Sede Argentina)
                </a>
                <a href="https://wa.me/593994287462" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#C5A059] transition-colors font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl w-fit">
                  <span className="text-2xl">🇪🇨</span> +593 0994287462 (Sede Ecuador)
                </a>
              </div>
            </div>

            {/* 3. Correos Corporativos */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-[#0A192F] font-black uppercase tracking-widest text-xs mb-6">Correos Corporativos</h4>
              <div className="space-y-3">
                <a href="mailto:info@estudiosporelmundo.com" className="flex items-center gap-3 text-slate-600 hover:text-[#C5A059] transition-colors font-bold text-sm group">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors"><Mail size={16}/></div>
                  info@estudiosporelmundo.com
                </a>
                <a href="mailto:contacto@estudiosporelmundo.com" className="flex items-center gap-3 text-slate-600 hover:text-[#C5A059] transition-colors font-bold text-sm group">
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors"><FileText size={16}/></div>
                  contacto@estudiosporelmundo.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">© 2025 Estudios por el Mundo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* --- WHATSAPP FLOTANTE --- */}
      <a 
        href="https://wa.me/593994287462?text=Hola%20EPM%20Agency,%20necesito%20asesor%C3%ADa." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#25D366] text-white p-4 md:p-5 rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] hover:scale-110 hover:-translate-y-2 transition-all z-50 flex items-center justify-center group"
      >
        <MessageCircle size={32} fill="white" className="text-[#25D366] w-6 h-6 md:w-8 md:h-8" />
      </a>

    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ServiceCard({ icon, title, description, highlighted = false, whatsappMessage }: any) {
  const finalMessage = whatsappMessage || "Hola EPM, quiero más información sobre sus servicios.";
  const link = `https://wa.me/593994287462?text=${encodeURIComponent(finalMessage)}`;

  return (
    <div className={`h-full p-8 md:p-10 rounded-[2.5rem] border transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center group ${highlighted ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-2xl shadow-blue-900/20' : 'bg-white border-gray-100 text-[#0A192F] hover:shadow-xl hover:border-[#C5A059]/30'}`}>
      <div className={`mb-8 p-5 rounded-3xl transition-colors ${highlighted ? 'bg-white/10 text-[#C5A059]' : 'bg-[#0A192F]/5 text-[#0A192F] group-hover:bg-[#C5A059] group-hover:text-white'}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{title}</h3>
      <p className={`text-sm md:text-base font-medium leading-relaxed mb-8 flex-grow ${highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
        {description}
      </p>
      
      {/* BOTÓN DE MÁS INFORMACIÓN */}
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg hover:scale-105 flex items-center gap-2 mt-auto ${highlighted ? 'bg-[#C5A059] text-white hover:bg-white hover:text-[#0A192F]' : 'bg-[#0A192F] text-white hover:bg-[#C5A059]'}`}
      >
        Quiero más información <ArrowRight size={14}/>
      </a>
    </div>
  );
}

function TestimonialCard({ name, role, text }: { name: string, role: string, text: string }) {
  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative">
      <Quote size={40} className="text-[#C5A059]/20 absolute top-8 right-8" />
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="#C5A059" className="text-[#C5A059]" />)}
      </div>
      <p className="text-slate-600 font-medium italic mb-8 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-black text-[#0A192F]">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-[#0A192F]">{name}</h4>
          <p className="text-xs text-[#C5A059] font-bold uppercase tracking-widest">{role}</p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value }: { label: string, value: string }) {
  const isDone = value && (value.toLowerCase() === "finalizado" || value.toLowerCase() === "completa");
  
  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all text-left ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-orange-50/50 border-orange-100'}`}>
      <div className={`mb-4 w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
        {isDone ? <CheckCircle2 size={16} /> : <Clock size={16} />}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <span className={`font-bold text-sm tracking-tight uppercase ${isDone ? 'text-emerald-700' : 'text-orange-700'}`}>
        {value}
      </span>
    </div>
  );
}