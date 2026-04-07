"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { 
  Users, Plus, Search, LogOut, FileText, MoreVertical, 
  X, Upload, Trash2, Save, DollarSign, Loader2,
  GraduationCap, Stethoscope, BookOpen, Eye, Lock, ExternalLink, 
  AlertTriangle, Menu, ShieldCheck, FolderOpen, FileSignature, FileBadge, FileDigit,
  TrendingUp, Wallet, Target, TrendingDown, ClipboardList
} from 'lucide-react';

type Archivo = { name: string; url: string; size: string; date: string; categoria?: string; };

type Cliente = {
  id: string;
  nombre: string;
  tipo: 'Universitario' | 'Especialidad' | 'Maestría';
  dni: string;
  convalidacion: string;
  documentacion: string;
  progreso: number;
  observaciones: string;
  bitacora_interna: string;
  notas_documentos: string; 
  finanzas: { total: number; abonado: number; };
  archivos: Archivo[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDocsEditing, setIsDocsEditing] = useState(false); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Trámite Principal'); 
  
  // ROLES Y PESTAÑAS
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'documentos' | 'dashboard'>('estudiantes');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  // NOTAS DIRECTIVAS (Guardadas en el navegador)
  const [metasMes, setMetasMes] = useState('');
  const [pagosPendientes, setPagosPendientes] = useState('');

  const [newClientData, setNewClientData] = useState<Partial<Cliente>>({
    nombre: '', id: '', tipo: 'Universitario', dni: 'Pendiente', convalidacion: 'Pendiente', 
    documentacion: 'Incompleta', progreso: 0, observaciones: '', bitacora_interna: '', notas_documentos: '',
    finanzas: { total: 0, abonado: 0 }
  });

  useEffect(() => {
    const session = sessionStorage.getItem('epm_session');
    const user = sessionStorage.getItem('epm_user') || '';
    
    if (!session) { router.push('/admin/login'); return; }
    
    setCurrentUser(user);
    // VALIDACIÓN DE ROL: Solo estos correos verán las finanzas globales
    if (user === 'admin@epm.com' || user === 'mateo@estudiosporelmundo.com') {
      setIsSuperAdmin(true);
    }

    // Cargar notas directivas de memoria local
    setMetasMes(localStorage.getItem('epm_metas') || '');
    setPagosPendientes(localStorage.getItem('epm_pagos') || '');

    fetchClientes();
    const handleBeforeUnload = () => sessionStorage.removeItem('epm_session');
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [router]);

  async function fetchClientes() {
    setLoading(true);
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) console.error('Error:', error.message);
    else setClientes(data || []);
    setLoading(false);
  }

  // GUARDAR NOTAS DIRECTIVAS
  const handleSaveDirectiva = () => {
    localStorage.setItem('epm_metas', metasMes);
    localStorage.setItem('epm_pagos', pagosPendientes);
    alert("Notas directivas guardadas localmente.");
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      id: newClientData.id || '', nombre: newClientData.nombre || '', tipo: newClientData.tipo || 'Universitario',
      dni: 'Pendiente', convalidacion: 'Pendiente', documentacion: 'Incompleta', progreso: newClientData.progreso || 0,
      observaciones: '', bitacora_interna: '', notas_documentos: '', finanzas: newClientData.finanzas || { total: 0, abonado: 0 },
      archivos: []
    };

    const { error } = await supabase.from('clientes').insert([newClient]);
    if (error) alert("Error al crear: " + error.message);
    else { alert("Cliente creado exitosamente"); setShowCreateForm(false); fetchClientes(); }
  };

  const saveChanges = async () => {
    if (!selectedClient) return;
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: selectedClient.nombre, tipo: selectedClient.tipo, dni: selectedClient.dni,
        convalidacion: selectedClient.convalidacion, documentacion: selectedClient.documentacion,
        progreso: selectedClient.progreso, observaciones: selectedClient.observaciones,
        bitacora_interna: selectedClient.bitacora_interna, notas_documentos: selectedClient.notas_documentos || '',
        finanzas: selectedClient.finanzas, archivos: selectedClient.archivos
      }).eq('id', selectedClient.id);

    if (error) alert("Error de conexión: " + error.message);
    else { alert("Base de datos actualizada."); setIsEditing(false); setIsDocsEditing(false); fetchClientes(); }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    const confirmar = confirm(`ALERTA DE SEGURIDAD\n\n¿Seguro de ELIMINAR el expediente de ${selectedClient.nombre}?`);
    if (!confirmar) return;
    const { error } = await supabase.from('clientes').delete().eq('id', selectedClient.id);
    if (error) alert("Error al eliminar: " + error.message);
    else { alert("Expediente eliminado."); setIsEditing(false); setIsDocsEditing(false); fetchClientes(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedClient) return;
    setUploading(true);
    const file = e.target.files[0];
    const filePath = `${selectedClient.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const { error: uploadError } = await supabase.storage.from('expedientes').upload(filePath, file);
    if (uploadError) { alert("Error subiendo a la nube: " + uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('expedientes').getPublicUrl(filePath);
    const newFileObj: Archivo = { name: file.name, url: publicUrl, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', date: new Date().toLocaleDateString(), categoria: uploadCategory };

    setSelectedClient({ ...selectedClient, archivos: [...(selectedClient.archivos || []), newFileObj] });
    setUploading(false);
  };

  const removeFile = (fileUrl: string) => {
    if (!selectedClient) return;
    if (!confirm("¿Quitar este archivo permanentemente?")) return;
    const updatedFiles = selectedClient.archivos.filter(f => f.url !== fileUrl);
    setSelectedClient({ ...selectedClient, archivos: updatedFiles });
  };
  
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleLogout = () => { sessionStorage.removeItem('epm_session'); sessionStorage.removeItem('epm_user'); router.push('/admin/login'); };
  const calcularDeuda = (t: number, a: number) => t - a;
  const calcularPorcentaje = (t: number, a: number) => t > 0 ? Math.round((a / t) * 100) : 0;

  // CÁLCULOS GLOBALES (Solo para Super Admin)
  const totalProyectado = clientes.reduce((acc, c) => acc + (c.finanzas?.total || 0), 0);
  const totalCobrado = clientes.reduce((acc, c) => acc + (c.finanzas?.abonado || 0), 0);
  const totalDeudaGlobal = totalProyectado - totalCobrado;
  const deudores = clientes.filter(c => calcularDeuda(c.finanzas?.total || 0, c.finanzas?.abonado || 0) > 0).sort((a,b) => calcularDeuda(b.finanzas.total, b.finanzas.abonado) - calcularDeuda(a.finanzas.total, a.finanzas.abonado));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#0A192F] font-bold gap-3"><Loader2 className="animate-spin" /> Conectando con Supabase...</div>;

  // Categorizar archivos
  const clientFiles = selectedClient?.archivos?.filter(f => f.name.includes('[CLIENTE]')) || [];
  const contractFiles = selectedClient?.archivos?.filter(f => f.categoria === 'Contrato' && !f.name.includes('[CLIENTE]')) || [];
  const tramitesFiles = selectedClient?.archivos?.filter(f => f.categoria === 'Trámite Principal' && !f.name.includes('[CLIENTE]')) || [];
  const idFiles = selectedClient?.archivos?.filter(f => f.categoria === 'Identidad' && !f.name.includes('[CLIENTE]')) || [];
  const inscripcionFiles = selectedClient?.archivos?.filter(f => f.categoria === 'Inscripción Universidad' && !f.name.includes('[CLIENTE]')) || [];
  const otherFiles = selectedClient?.archivos?.filter(f => (!f.categoria || f.categoria === 'Otro') && !f.name.includes('[CLIENTE]')) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* NAVBAR MÓVIL */}
      <div className="md:hidden bg-[#0A192F] p-4 flex justify-between items-center text-white sticky top-0 z-30 shadow-md">
        <h1 className="text-xl font-black italic tracking-tighter">EPM <span className="text-[#C5A059] text-[10px] not-italic tracking-widest">ADMIN</span></h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2"><Menu size={24} /></button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A192F] text-white p-4 border-t border-white/10 flex flex-col gap-2 shadow-xl z-20">
          {isSuperAdmin && (
            <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#C5A059] text-[#0A192F]' : 'hover:bg-white/10'}`}><TrendingUp size={18} /> Finanzas y Dirección</button>
          )}
          <button onClick={() => { setActiveTab('estudiantes'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'estudiantes' ? 'bg-[#C5A059] text-[#0A192F]' : 'hover:bg-white/10'}`}><Users size={18} /> Gestión General</button>
          <button onClick={() => { setActiveTab('documentos'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 font-bold rounded-xl transition-all ${activeTab === 'documentos' ? 'bg-[#C5A059] text-[#0A192F]' : 'hover:bg-white/10'}`}><FolderOpen size={18} /> Contratos y Docs</button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm font-bold w-full px-4 py-3 mt-2 border-t border-white/10"><LogOut size={16} /> Cerrar Sesión</button>
        </div>
      )}

      {/* SIDEBAR ESCRITORIO */}
      <aside className="w-64 bg-[#0A192F] text-white fixed h-full hidden md:flex flex-col z-20">
        <div className="p-8"><h1 className="text-2xl font-black italic tracking-tighter">EPM <span className="text-[#C5A059] text-xs not-italic tracking-widest block">ADMIN PANEL</span></h1></div>
        
        <div className="px-6 mb-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          Usuario: <span className="text-[#C5A059] truncate">{currentUser.split('@')[0]}</span>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-2">
          {isSuperAdmin && (
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#C5A059] text-[#0A192F] scale-105' : 'bg-transparent text-slate-300 hover:bg-white/10'}`}>
              <TrendingUp size={18} /> Panel Directivo
            </button>
          )}
          <button onClick={() => setActiveTab('estudiantes')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all ${activeTab === 'estudiantes' ? 'bg-[#C5A059] text-[#0A192F] scale-105' : 'bg-transparent text-slate-300 hover:bg-white/10'}`}>
            <Users size={18} /> Gestión General
          </button>
          <button onClick={() => setActiveTab('documentos')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all ${activeTab === 'documentos' ? 'bg-[#C5A059] text-[#0A192F] scale-105' : 'bg-transparent text-slate-300 hover:bg-white/10'}`}>
            <FolderOpen size={18} /> Contratos y Docs
          </button>
        </nav>
        <div className="p-4 border-t border-white/10"><button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm font-bold hover:text-red-300 w-full px-4 transition-colors"><LogOut size={16} /> Cerrar Sesión</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10 mt-4 md:mt-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0A192F]">
              {activeTab === 'estudiantes' ? 'Base de Datos General' : activeTab === 'documentos' ? 'Bóveda de Documentos' : 'Resumen Financiero EPM'}
            </h2>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mt-1 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
              <ShieldCheck size={14} /> Nube Segura Conectada
            </div>
          </div>
          
          {activeTab !== 'dashboard' && (
            <button onClick={() => setShowCreateForm(true)} className="bg-[#0A192F] text-white px-5 md:px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-all shadow-lg w-full md:w-auto text-sm md:text-base">
              <Plus size={18} /> Nuevo Estudiante
            </button>
          )}
        </header>

        {/* ========================================== */}
        {/* VISTA 1: DASHBOARD DIRECTIVO (FINANZAS)    */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && isSuperAdmin && (
          <div className="space-y-8 animate-fade-in">
            {/* TARJETAS FINANCIERAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 bg-slate-50 w-32 h-32 rounded-full z-0 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><Target size={24}/></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Proyección Total</p>
                  <h3 className="text-4xl font-black text-[#0A192F]">${totalProyectado}</h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Valor total de todos los contratos actuales.</p>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-emerald-100 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 bg-emerald-50 w-32 h-32 rounded-full z-0 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-4"><Wallet size={24}/></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Saldo Cobrado (Caja)</p>
                  <h3 className="text-4xl font-black text-emerald-600">${totalCobrado}</h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Dinero real ingresado por los clientes.</p>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-red-100 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 bg-red-50 w-32 h-32 rounded-full z-0 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 mb-4"><TrendingDown size={24}/></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Deuda Pendiente</p>
                  <h3 className="text-4xl font-black text-red-500">${totalDeudaGlobal}</h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Dinero pendiente por cobrar en la calle.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* TABLA DE DEUDORES */}
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl">
                <h4 className="text-lg font-black text-[#0A192F] mb-4 flex items-center gap-2"><AlertTriangle className="text-orange-500" size={20}/> Clientes con Pagos Pendientes</h4>
                <div className="overflow-y-auto max-h-[300px] pr-2">
                  {deudores.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">No hay deudas registradas.</p>
                  ) : (
                    <div className="space-y-3">
                      {deudores.map(c => (
                        <div key={c.id} className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                          <div>
                            <p className="font-bold text-[#0A192F] text-sm">{c.nombre}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{c.tipo}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-500 font-black">${calcularDeuda(c.finanzas.total, c.finanzas.abonado)}</p>
                            <p className="text-[9px] text-slate-400 font-bold">De ${c.finanzas.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* BITÁCORA GLOBAL Y METAS */}
              <div className="bg-[#0A192F] rounded-[2rem] p-6 md:p-8 shadow-xl text-white flex flex-col">
                <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2"><ClipboardList className="text-[#C5A059]" size={20}/> Bitácora Directiva y Metas</h4>
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">Metas del Mes</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:border-[#C5A059] resize-none h-24 text-white placeholder-slate-400" 
                      placeholder="Ej: Cerrar 5 nuevas convalidaciones, renovar contratos..."
                      value={metasMes} onChange={e => setMetasMes(e.target.value)}
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1 block">Pagos e Inversiones por Hacer</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:border-blue-400 resize-none h-24 text-white placeholder-slate-400" 
                      placeholder="Ej: Pagar hosting, pago a gestores en Argentina..."
                      value={pagosPendientes} onChange={e => setPagosPendientes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <button onClick={handleSaveDirectiva} className="w-full mt-4 bg-[#C5A059] text-[#0A192F] font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                  <Save size={16}/> Guardar Notas Privadas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* VISTA 2 Y 3: TABLA DE ESTUDIANTES O DOCS   */}
        {/* ========================================== */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden w-full animate-fade-in">
            <div className="p-4 md:p-6 border-b border-gray-50 flex gap-4">
              <div className="flex-1 bg-slate-50 rounded-xl flex items-center px-4">
                <Search className="text-slate-400" size={18} />
                <input type="text" placeholder="Buscar por nombre o cédula..." className="w-full bg-transparent p-3 outline-none font-medium text-sm md:text-base" />
              </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="p-4 md:p-6">Estudiante</th>
                    <th className="p-4 md:p-6">{activeTab === 'estudiantes' ? 'Progreso' : 'Estado Legal'}</th>
                    <th className="p-4 md:p-6">{activeTab === 'estudiantes' ? 'Finanzas' : 'Archivos en Nube'}</th>
                    <th className="p-4 md:p-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => { 
                        setSelectedClient(cliente); 
                        if(activeTab === 'estudiantes') setIsEditing(true); 
                        else setIsDocsEditing(true); 
                      }}>
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#0A192F] shrink-0">{cliente.nombre.charAt(0)}</div>
                          <div><div className="font-bold text-[#0A192F] text-sm md:text-lg truncate max-w-[200px] md:max-w-none">{cliente.nombre}</div><div className="flex flex-wrap gap-2 items-center mt-1"><span className="text-[10px] md:text-xs text-slate-400 font-mono">{cliente.id}</span><ServiceBadge tipo={cliente.tipo} /></div></div>
                        </div>
                      </td>
                      
                      {activeTab === 'estudiantes' ? (
                        <>
                          <td className="p-4 md:p-6 space-y-2">
                              <div className="flex items-center gap-2 justify-between text-[10px] md:text-xs font-bold text-slate-500"><span>DNI:</span> <StatusBadge status={cliente.dni} /></div>
                              <div className="flex items-center gap-2 justify-between text-[10px] md:text-xs font-bold text-slate-500"><span>Global:</span> <span className="text-[#C5A059]">{cliente.progreso}%</span></div>
                          </td>
                          <td className="p-4 md:p-6">
                             <div className="text-[10px] md:text-xs font-bold text-slate-500">Pendiente: <span className="text-red-500">${calcularDeuda(cliente.finanzas.total, cliente.finanzas.abonado)}</span></div>
                             <div className="w-20 md:w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#C5A059]" style={{ width: `${calcularPorcentaje(cliente.finanzas.total, cliente.finanzas.abonado)}%` }}></div></div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 md:p-6 space-y-2">
                             <div className="flex items-center gap-2 justify-between text-[10px] md:text-xs font-bold text-slate-500"><span>Revisión:</span> <StatusBadge status={cliente.documentacion} /></div>
                             <div className="text-[10px] text-slate-400 truncate max-w-[150px] italic">{cliente.notas_documentos ? 'Ver notas internas...' : 'Sin notas'}</div>
                          </td>
                          <td className="p-4 md:p-6">
                             <div className="flex items-center gap-2 font-bold text-sm text-[#0A192F]"><FolderOpen size={16} className="text-[#C5A059]"/> {cliente.archivos?.length || 0} Documentos</div>
                             {cliente.archivos?.some(f => f.name.includes('[CLIENTE]')) && <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded mt-1 inline-block">Nuevos del cliente</span>}
                          </td>
                        </>
                      )}
                      <td className="p-4 md:p-6 text-right"><MoreVertical size={18} className="text-slate-400 inline-block"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================================================== */}
      {/* TODOS LOS MODALES A CONTINUACIÓN (Crear, Editar, Docs) */}
      {/* ================================================== */}

      {/* MODAL CREAR CLIENTE */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[95vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6"><h3 className="text-xl md:text-2xl font-black text-[#0A192F]">Nuevo Estudiante</h3><button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button></div>
             <form onSubmit={handleCreateClient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Nombre Completo" className="bg-slate-50 p-3 md:p-4 rounded-xl outline-none font-bold w-full text-sm md:text-base border border-transparent focus:border-[#C5A059] transition-colors" onChange={e => setNewClientData({...newClientData, nombre: e.target.value})} />
                  <input required placeholder="Cédula / Pasaporte" className="bg-slate-50 p-3 md:p-4 rounded-xl outline-none font-bold w-full text-sm md:text-base border border-transparent focus:border-[#C5A059] transition-colors" onChange={e => setNewClientData({...newClientData, id: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                   {['Universitario', 'Especialidad', 'Maestría'].map(t => (
                     <button key={t} type="button" onClick={() => setNewClientData({...newClientData, tipo: t as any})} className={`p-3 text-xs font-bold rounded-xl border transition-all ${newClientData.tipo === t ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-md' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>{t}</button>
                   ))}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progreso Inicial (%)</label>
                    <input type="number" min="0" max="100" className="w-full bg-slate-50 p-3 md:p-4 rounded-xl outline-none font-bold text-sm md:text-base border border-transparent focus:border-[#C5A059]" placeholder="0" onChange={e => setNewClientData({...newClientData, progreso: Number(e.target.value)})} />
                </div>
                <div className="bg-blue-50/50 p-4 md:p-5 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-[#0A192F] text-xs mb-3 flex items-center gap-2"><DollarSign size={14}/> Datos Financieros</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Costo Total ($)</label>
                      <input type="number" placeholder="0" className="bg-white p-3 rounded-xl outline-none w-full font-bold shadow-sm" onChange={e => setNewClientData({...newClientData, finanzas: { ...newClientData.finanzas!, total: Number(e.target.value) }})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Abono Inicial ($)</label>
                      <input type="number" placeholder="0" className="bg-white p-3 rounded-xl outline-none w-full font-bold shadow-sm" onChange={e => setNewClientData({...newClientData, finanzas: { ...newClientData.finanzas!, abonado: Number(e.target.value) }})} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[#0A192F] text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#C5A059] shadow-lg transition-all mt-4">Guardar en Base de Datos</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL 1: GESTIÓN GENERAL */}
      {isEditing && selectedClient && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] w-full max-w-6xl max-h-[98vh] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-fade-in relative">
            <div className="w-full lg:w-4/12 bg-slate-50 p-6 md:p-8 lg:border-r border-gray-100 overflow-y-auto max-h-[40vh] lg:max-h-full border-b lg:border-b-0">
              <h3 className="text-lg md:text-xl font-black text-[#0A192F] mb-6 flex items-center gap-2"><FileText size={20} className="text-[#C5A059]"/> Ficha General</h3>
              <div className="space-y-4 md:space-y-5">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                   <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudiante</label>
                   <input className="w-full font-black text-[#0A192F] text-base md:text-lg bg-transparent border-b border-gray-100 pb-1 mb-2 outline-none focus:border-[#C5A059] transition-colors" value={selectedClient.nombre} onChange={(e) => setSelectedClient({...selectedClient, nombre: e.target.value})} />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-center mb-3">
                      <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Progreso del Trámite</label>
                      <span className="font-black text-[#C5A059] bg-[#C5A059]/10 px-2 py-1 rounded-md">{selectedClient.progreso}%</span>
                   </div>
                   <input type="range" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#C5A059]" min="0" max="100" value={selectedClient.progreso} onChange={(e) => setSelectedClient({...selectedClient, progreso: Number(e.target.value)})} />
                </div>
                <div className="bg-[#0A192F] p-5 rounded-2xl text-white relative overflow-hidden shadow-lg">
                   <DollarSign className="absolute top-4 right-4 text-white/5" size={60} />
                   <h4 className="font-bold text-[#C5A059] text-[10px] md:text-xs uppercase tracking-widest mb-4">Estado Financiero</h4>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total</p><div className="flex items-center text-lg font-black">$<input type="number" className="bg-transparent w-full outline-none ml-1" value={selectedClient.finanzas.total} onChange={(e) => setSelectedClient({...selectedClient, finanzas: {...selectedClient.finanzas, total: Number(e.target.value)}})} /></div></div>
                      <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Pagado</p><div className="flex items-center text-lg font-black text-emerald-400">$<input type="number" className="bg-transparent w-full outline-none ml-1" value={selectedClient.finanzas.abonado} onChange={(e) => setSelectedClient({...selectedClient, finanzas: {...selectedClient.finanzas, abonado: Number(e.target.value)}})} /></div></div>
                   </div>
                   <div className="pt-3 border-t border-white/10 flex justify-between items-center"><span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Deuda</span><span className="text-xl md:text-2xl font-black text-white">${calcularDeuda(selectedClient.finanzas.total, selectedClient.finanzas.abonado)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"><label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">DNI</label><select className="w-full bg-transparent font-bold text-xs md:text-sm text-[#0A192F] outline-none" value={selectedClient.dni} onChange={(e) => setSelectedClient({...selectedClient, dni: e.target.value})}><option>Pendiente</option><option>En trámite</option><option>Finalizado</option></select></div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"><label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Convalidación</label><select className="w-full bg-transparent font-bold text-xs md:text-sm text-[#0A192F] outline-none" value={selectedClient.convalidacion} onChange={(e) => setSelectedClient({...selectedClient, convalidacion: e.target.value})}><option>Pendiente</option><option>En trámite</option><option>Finalizado</option></select></div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-8/12 p-6 md:p-8 flex flex-col bg-white overflow-y-auto lg:max-h-full">
              <div className="flex justify-between items-start mb-6">
                <div><h3 className="text-xl md:text-2xl font-black text-[#0A192F]">Gestión Diaria</h3></div>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-600"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 flex-grow">
                <div className="flex flex-col h-full">
                  <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#0A192F] mb-2 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"><Eye size={14}/> Visible para Cliente</label>
                  <textarea className="flex-1 w-full min-h-[150px] bg-blue-50/30 p-4 rounded-2xl border-2 border-blue-50 outline-none focus:border-[#0A192F] text-slate-700 text-sm font-medium resize-none transition-colors" placeholder="Mensaje público para el portal..." value={selectedClient.observaciones} onChange={(e) => setSelectedClient({...selectedClient, observaciones: e.target.value})} />
                </div>
                <div className="flex flex-col h-full">
                  <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2 bg-red-50 px-3 py-1.5 rounded-lg w-fit"><Lock size={14}/> Bitácora Interna</label>
                  <textarea className="flex-1 w-full min-h-[150px] bg-yellow-50/50 p-4 rounded-2xl border-2 border-yellow-100 outline-none focus:border-[#C5A059] text-slate-700 text-sm font-medium resize-none transition-colors" placeholder="Notas solo para asesores EPM..." value={selectedClient.bitacora_interna} onChange={(e) => setSelectedClient({...selectedClient, bitacora_interna: e.target.value})} />
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#C5A059]/20 p-3 rounded-full text-[#C5A059]"><FolderOpen size={24}/></div>
                  <div>
                    <h4 className="font-bold text-[#0A192F]">Bóveda de Documentos y Contratos</h4>
                    <p className="text-xs text-slate-500">Tiene {selectedClient.archivos?.length || 0} archivos adjuntos.</p>
                  </div>
                </div>
                <button onClick={() => { setIsEditing(false); setActiveTab('documentos'); setIsDocsEditing(true); }} className="bg-white border-2 border-[#0A192F] text-[#0A192F] px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#0A192F] hover:text-white transition-all w-full sm:w-auto">
                  Abrir Bóveda
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 mt-auto gap-4">
                <button onClick={handleDeleteClient} className="w-full sm:w-auto px-4 py-3 text-red-500 font-bold bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"><AlertTriangle size={16}/> Borrar Expediente</button>
                <button onClick={saveChanges} className="w-full sm:w-auto px-8 py-4 bg-[#0A192F] text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-[#C5A059] shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"><Save size={18} /> Guardar Todo en Nube</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BÓVEDA DE DOCUMENTOS */}
      {isDocsEditing && selectedClient && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] w-full max-w-7xl max-h-[98vh] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-fade-in relative">
            
            <div className="w-full lg:w-4/12 bg-slate-50 p-6 md:p-8 lg:border-r border-gray-100 overflow-y-auto max-h-[40vh] lg:max-h-full border-b lg:border-b-0 flex flex-col">
              <h3 className="text-lg md:text-xl font-black text-[#0A192F] mb-2 flex items-center gap-2"><FolderOpen size={20} className="text-[#C5A059]"/> Bóveda Documental</h3>
              <p className="text-xs text-slate-500 font-bold mb-6">{selectedClient.nombre}</p>
              
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 shadow-sm mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-orange-700 block mb-2">Estado de Recolección (Portal Cliente)</label>
                  <select className="w-full bg-white p-3 rounded-xl font-bold text-sm text-[#0A192F] outline-none border border-orange-200" value={selectedClient.documentacion} onChange={(e) => setSelectedClient({...selectedClient, documentacion: e.target.value})}>
                    <option>Incompleta</option>
                    <option>En revisión</option>
                    <option>Completa</option>
                  </select>
                  <p className="text-[9px] text-orange-600 mt-2 font-medium leading-tight">Si marcas "Incompleta" o "En revisión", el cliente podrá subir archivos desde su portal web.</p>
              </div>

              <div className="flex flex-col flex-grow">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0A192F] mb-2 bg-blue-50 px-3 py-1.5 rounded-lg w-fit"><FileSignature size={14}/> Libreta Legal y Documental</label>
                  <textarea className="flex-1 w-full min-h-[200px] bg-white p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-[#C5A059] text-slate-700 text-sm font-medium resize-none shadow-sm" placeholder="Anota aquí firmas pendientes, fechas de vencimiento de pasaportes, estatus de legalizaciones..." value={selectedClient.notas_documentos || ''} onChange={(e) => setSelectedClient({...selectedClient, notas_documentos: e.target.value})} />
              </div>
            </div>

            <div className="w-full lg:w-8/12 p-6 md:p-8 flex flex-col bg-white overflow-y-auto lg:max-h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl md:text-2xl font-black text-[#0A192F]">Gestor de Archivos</h3>
                <button onClick={() => setIsDocsEditing(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-600"/></button>
              </div>

              <div className="bg-[#0A192F] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 mb-8 shadow-lg">
                 <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Categoría del documento</label>
                    <select className="w-full bg-[#0A192F] text-white border-b border-white/20 pb-2 outline-none font-bold text-sm" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                       <option value="Contrato">Contrato Legal</option>
                       <option value="Trámite Principal">Trámite Principal (Convalidación/DNI)</option>
                       <option value="Identidad">Identidad (Pasaporte/Partidas)</option>
                       <option value="Inscripción Universidad">Inscripción Universidad (Grado/Especialidad/Maestría)</option>
                       <option value="Otro">Otro Documento</option>
                    </select>
                 </div>
                 <div className="w-full md:w-auto">
                   <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
                   <button onClick={triggerFileInput} disabled={uploading} className="w-full md:w-auto bg-[#C5A059] text-[#0A192F] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
                     {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                     {uploading ? 'Guardando en Nube...' : 'Subir Archivo'}
                   </button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                 {clientFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-orange-600 text-sm mb-3 flex items-center gap-2 border-b border-orange-100 pb-2"><ExternalLink size={16}/> Subidos por el Cliente</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {clientFiles.map((file, i) => (
                         <div key={i} className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-orange-800 hover:underline truncate"><FileText size={14} className="shrink-0"/> {file.name.replace('[CLIENTE]', '').trim()}</a>
                           <button onClick={() => removeFile(file.url)} className="text-orange-400 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {contractFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-[#0A192F] text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><FileSignature size={16} className="text-[#C5A059]"/> Contratos Legales</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {contractFiles.map((file, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:border-[#C5A059]/50 transition-colors">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A192F] hover:underline truncate"><FileText size={14} className="shrink-0 text-slate-400"/> {file.name}</a>
                           <button onClick={() => removeFile(file.url)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {tramitesFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-[#0A192F] text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><FileBadge size={16} className="text-[#C5A059]"/> Documentos de Trámite</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {tramitesFiles.map((file, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:border-[#C5A059]/50 transition-colors">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A192F] hover:underline truncate"><FileText size={14} className="shrink-0 text-slate-400"/> {file.name}</a>
                           <button onClick={() => removeFile(file.url)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {inscripcionFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-[#0A192F] text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><GraduationCap size={16} className="text-[#C5A059]"/> Inscripción Universitaria</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {inscripcionFiles.map((file, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:border-[#C5A059]/50 transition-colors">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A192F] hover:underline truncate"><FileText size={14} className="shrink-0 text-slate-400"/> {file.name}</a>
                           <button onClick={() => removeFile(file.url)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {idFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-[#0A192F] text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><FileDigit size={16} className="text-[#C5A059]"/> Identidad</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {idFiles.map((file, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:border-[#C5A059]/50 transition-colors">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A192F] hover:underline truncate"><FileText size={14} className="shrink-0 text-slate-400"/> {file.name}</a>
                           <button onClick={() => removeFile(file.url)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {otherFiles.length > 0 && (
                   <div>
                     <h4 className="font-black text-[#0A192F] text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><FolderOpen size={16} className="text-slate-400"/> Otros Archivos</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {otherFiles.map((file, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:border-[#C5A059]/50 transition-colors">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A192F] hover:underline truncate"><FileText size={14} className="shrink-0 text-slate-400"/> {file.name}</a>
                           <button onClick={() => removeFile(file.url)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {(!selectedClient.archivos || selectedClient.archivos.length === 0) && (
                   <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-2xl">
                     La bóveda de este estudiante está vacía.
                   </div>
                 )}
              </div>

              <div className="flex justify-end items-center pt-6 border-t border-slate-100 mt-6 gap-4">
                <button onClick={saveChanges} className="w-full md:w-auto px-8 py-4 bg-[#0A192F] text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-[#C5A059] shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> Guardar Bóveda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isDone = status && (status.toLowerCase() === "finalizado" || status.toLowerCase() === "completa");
  const isWarning = status && (status.toLowerCase().includes("incompleta") || status.toLowerCase().includes("revisión"));
  let colorClass = "bg-slate-50 text-slate-600 border-slate-200";
  if (isDone) colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
  else if (isWarning) colorClass = "bg-orange-50 text-orange-600 border-orange-200";
  return <span className={`px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>{status}</span>;
}

function ServiceBadge({ tipo }: { tipo: string }) {
  let icon = <GraduationCap size={12} />;
  let color = "bg-blue-50 text-blue-700 border-blue-200";
  if (tipo === "Especialidad") { icon = <Stethoscope size={12} />; color = "bg-purple-50 text-purple-700 border-purple-200"; } 
  else if (tipo === "Maestría") { icon = <BookOpen size={12} />; color = "bg-amber-50 text-amber-700 border-amber-200"; }
  return <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${color}`}>{icon} {tipo}</span>;
}