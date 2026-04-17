'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, LogOut, Scissors, Users, Calendar, TrendingUp, Settings, ExternalLink, Phone, Clock, Type } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'config'>('agenda')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [turns, setTurns] = useState<any[]>([])
  
  // States for Editing Config
  const [editNombre, setEditNombre] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editMaps, setEditMaps] = useState('')
  const [editApertura, setEditApertura] = useState('')
  const [editCierre, setEditCierre] = useState('')
  const [editIntervalo, setEditIntervalo] = useState(30)
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/auth')
        return
      }
      setUser(user)
      fetchData(user.id)
    }
    checkUser()
  }, [])

  const fetchData = async (userId: string) => {
    setLoading(true)
    try {
      const { data: configData } = await supabase
        .from('configuracion_barberia')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (configData) {
        setConfig(configData)
        // Llenar campos de edición
        setEditNombre(configData.nombre_barberia)
        setEditPhone(configData.telefono_barbero.replace('+54', ''))
        setEditMaps(configData.google_maps_link || '')
        setEditApertura(configData.hora_apertura)
        setEditCierre(configData.hora_cierre)
        setEditIntervalo(configData.intervalo_minutos)

        const { data: turnsData } = await supabase
          .from('turnos')
          .select('*')
          .eq('barbero_id', userId)
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true })
        
        setTurns(turnsData || [])
      } else {
        router.push('/dashboard/onboarding')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Generar nuevo slug si el nombre cambió
    const newSlug = editNombre.toLowerCase().trim().replace(/\s+/g, '-')
    
    const { error } = await supabase
      .from('configuracion_barberia')
      .update({
        nombre_barberia: editNombre,
        slug: newSlug,
        telefono_barbero: `+54${editPhone}`,
        google_maps_link: editMaps,
        hora_apertura: editApertura,
        hora_cierre: editCierre,
        intervalo_minutos: editIntervalo
      })
      .eq('user_id', user.id)

    if (error) {
      alert(`Error al actualizar: ${error.message}`)
    } else {
      await fetchData(user.id)
      alert('Configuración actualizada con éxito')
      setActiveTab('agenda')
    }
    setSaving(false)
  }

  const handleFinish = async (id: string) => {
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', id)
      .eq('barbero_id', user.id)

    if (!error) {
      setTurns(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex pb-12 font-sans overflow-x-hidden">
      {/* Sidebar Fijo */}
      <aside className="hidden lg:flex w-72 flex-col bg-zinc-900/50 border-r border-zinc-800/50 p-6 backdrop-blur-md sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 bg-amber-600 rounded-xl shadow-lg shadow-amber-900/20">
            <Scissors className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic truncate">{config?.nombre_barberia || 'BARBERIAPP'}</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'agenda' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" /> Turnos Hoy
          </button>
          <Link href={`/reserva/${config?.slug}`} target="_blank" className="w-full flex items-center gap-4 px-4 py-4 text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-2xl transition-all uppercase text-sm font-bold tracking-wider">
            <ExternalLink className="w-5 h-5" /> Ver Mi Web
          </Link>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'config' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors mt-auto font-bold uppercase text-xs tracking-widest">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      {/* Navegación Mobile */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-white/5 px-4 py-3 rounded-full flex items-center gap-2 z-50 shadow-2xl">
        <button onClick={() => setActiveTab('agenda')} className={`p-4 rounded-full transition-all ${activeTab === 'agenda' ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/40' : 'text-zinc-500'}`}><Calendar className="w-6 h-6" /></button>
        <Link href={`/reserva/${config?.slug}`} target="_blank" className="p-4 text-zinc-500"><ExternalLink className="w-6 h-6" /></Link>
        <button onClick={() => setActiveTab('config')} className={`p-4 rounded-full transition-all ${activeTab === 'config' ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/40' : 'text-zinc-500'}`}><Settings className="w-6 h-6" /></button>
        <div className="w-[1px] h-6 bg-zinc-800 mx-2" />
        <button onClick={handleLogout} className="p-4 text-red-500/50"><LogOut className="w-6 h-6" /></button>
      </nav>

      <main className="flex-1 p-6 lg:p-12">
        {activeTab === 'agenda' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Mi Agenda</h1>
                <p className="text-zinc-500 font-medium italic">Gestión operativa para <span className="text-amber-500 font-bold">{config?.nombre_barberia}</span></p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2rem] min-w-[140px] shadow-xl">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Pendientes Hoy</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-amber-500 leading-none">{turns.length}</span>
                  <Users className="w-5 h-5 text-zinc-700 mb-1" />
                </div>
              </div>
            </header>

            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Próximos Turnos</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ACTUALIZADO</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800/30 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-6">Cliente</th>
                      <th className="px-8 py-6">Hora</th>
                      <th className="px-8 py-6 text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/20">
                    {turns.length > 0 ? (
                      turns.map((turn) => (
                        <tr key={turn.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-8">
                            <div className="font-black text-lg text-zinc-100 uppercase tracking-tight mb-1">{turn.cliente_nombre}</div>
                            <div className="text-xs text-zinc-500 font-bold flex items-center gap-2"><Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}</div>
                          </td>
                          <td className="px-8 py-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 text-amber-500 rounded-xl font-mono font-black border border-amber-600/10">
                              <Clock className="w-4 h-4" /> {turn.hora.substring(0, 5)}hs
                            </div>
                          </td>
                          <td className="px-8 py-8 text-right">
                            <button
                              onClick={() => handleFinish(turn.id)}
                              className="inline-flex items-center gap-3 px-6 py-3.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-2xl transition-all font-black text-xs uppercase tracking-tighter shadow-lg shadow-emerald-900/5 border border-emerald-600/20 active:scale-90"
                            >
                              <CheckCircle className="w-4 h-4" /> 
                              FINALIZAR
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center">
                          <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter italic">Sin Turnos</div>
                          <p className="text-zinc-600 font-medium italic">Todo despejado por hoy.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Configuración</h1>
              <p className="text-zinc-500 font-medium italic">Personalizá tu local y horarios de atención</p>
            </header>

            <form onSubmit={handleUpdateConfig} className="space-y-8">
              {/* Sección Identidad */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-amber-500 mb-2">
                  <div className="p-3 bg-amber-600/10 rounded-2xl"><Type className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Identidad del Local</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Nombre de la Barbería</label>
                    <input 
                      required 
                      value={editNombre} 
                      onChange={(e) => setEditNombre(e.target.value)} 
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold transition-all" 
                    />
                    {editNombre !== config.nombre_barberia && (
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-2 animate-pulse">
                        ⚠️ ATENCIÓN: Al cambiar el nombre, tu URL de reserva también cambiará.
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Link de Reserva (Slug)</label>
                    <div className="bg-zinc-950/30 border border-zinc-800 rounded-2xl py-5 px-6 text-zinc-600 font-mono text-sm truncate">
                      barberiapp.com/reserva/{editNombre.toLowerCase().trim().replace(/\s+/g, '-')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Contacto */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-amber-500 mb-2">
                  <div className="p-3 bg-amber-600/10 rounded-2xl"><Phone className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Contacto y Ubicación</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp de Reservas</label>
                    <div className="flex bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-amber-500/50 transition-all">
                      <div className="bg-zinc-900 px-6 py-5 border-r border-zinc-800 text-zinc-500 font-black">+54</div>
                      <input 
                        required 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))} 
                        className="flex-1 bg-transparent py-5 px-6 outline-none text-white font-bold" 
                        placeholder="2634XXXXXX"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Google Maps Link (Opcional)</label>
                    <input 
                      value={editMaps} 
                      onChange={(e) => setEditMaps(e.target.value)} 
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Sección Horarios */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-amber-500 mb-2">
                  <div className="p-3 bg-amber-600/10 rounded-2xl"><Clock className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Horarios de Atención</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Apertura</label>
                    <input 
                      type="time" 
                      required 
                      value={editApertura} 
                      onChange={(e) => setEditApertura(e.target.value)} 
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold transition-all [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Cierre</label>
                    <input 
                      type="time" 
                      required 
                      value={editCierre} 
                      onChange={(e) => setEditCierre(e.target.value)} 
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold transition-all [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-3 col-span-2 md:col-span-1">
                    <label className="text-sm font-black uppercase tracking-widest text-zinc-500 ml-1">Intervalo (Minutos)</label>
                    <select 
                      value={editIntervalo} 
                      onChange={(e) => setEditIntervalo(parseInt(e.target.value))}
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold appearance-none transition-all cursor-pointer"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>1 hora</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-8">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full md:w-auto px-12 py-6 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
                >
                  {saving && <Loader2 className="w-6 h-6 animate-spin" />}
                  {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return <TrendingUp className={className} /> // Placeholder for Loader
}
