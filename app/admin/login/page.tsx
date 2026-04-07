"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock, ArrowRight, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Limpiar cualquier sesión anterior al entrar por seguridad
  useEffect(() => {
    sessionStorage.removeItem('epm_session');
    sessionStorage.removeItem('epm_user');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // SIMULACIÓN DE CREDENCIALES Y ROLES
    setTimeout(() => {
      // Para pruebas, la contraseña de todos será "admin". 
      // Pero el sistema registrará QUÉ correo entró para darle los permisos.
      if (
        (email === 'admin@epm.com' || email === 'mateo@estudiosporelmundo.com' || email === 'asesor@epm.com') 
        && password === 'admin'
      ) {
        sessionStorage.setItem('epm_session', 'active');
        sessionStorage.setItem('epm_user', email); // GUARDAMOS EL CORREO PARA EL ROL
        router.push('/admin');
      } else {
        setError(true);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl relative z-10 border border-white/20">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#C5A059]"></div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0A192F] rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 relative">
            <Globe size={32} />
            <div className="absolute -bottom-2 -right-2 bg-[#C5A059] p-1.5 rounded-full border-2 border-white">
              <ShieldCheck size={14} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#0A192F] mb-1 tracking-tight">EPM ADMIN</h1>
          <p className="text-slate-500 font-medium text-sm">Panel de Gestión Segura</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Correo de Usuario</label>
            <div className="relative">
              <input 
                type="email" required placeholder="admin@epm.com"
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-4 rounded-xl outline-none focus:border-[#C5A059] focus:bg-white transition-all font-bold text-[#0A192F]"
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Contraseña</label>
            <div className="relative">
              <input 
                type="password" required placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-4 rounded-xl outline-none focus:border-[#C5A059] focus:bg-white transition-all font-bold text-[#0A192F]"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-fade-in">
              <AlertCircle size={16} className="shrink-0" /> Credenciales incorrectas.
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#0A192F] text-white py-4 md:py-5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#C5A059] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-4">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Ingresar al Sistema'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}