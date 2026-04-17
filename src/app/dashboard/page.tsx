'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, LogOut, Scissors, Users, Calendar, TrendingUp, Settings, ExternalLink, Phone, Clock, Type, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'config' | 'programar'>('agenda')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [turns, setTurns] = useState<any[]>([])
  
  // Estados para Agenda Flexible (0-6)
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([])
  
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
        setEditNombre(configData.nombre_barberia)
        setEditPhone(configData.telefono_barbero.replace('+54', ''))
        setEditMaps(configData.google_maps_link || '')
        setEditApertura(configData.hora_apertura)
        setEditCierre(configData.hora_cierre)
        setEditIntervalo(configData.intervalo_minutos)

        // Cargar Horarios Flexibles
        const { data: scheduleData } = await supabase
          .from('horarios_barberia')
          .select('*')
          .eq('user_id', userId)
          .order('dia_semana', { ascending: true })

        if (scheduleData && scheduleData.length > 0) {
          setWeeklySchedule(scheduleData)
        } else {
          // Migración automática: Crear base L-S activa, D inactiva
          const initial = [0,1,2,3,4,5,6].map(dia => ({
            dia_semana: dia,
            activo: dia !== 0,
            h_apertura: configData.hora_apertura,
            h_cierre: configData.hora_cierre
          }))
          setWeeklySchedule(initial)
        }

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

  const handleUpdateSchedule = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('horarios_barberia')
        .upsert(
          weeklySchedule.map(s => ({
            user_id: user.id,
            dia_semana: s.dia_semana,
            activo: s.activo,
            slots: s.slots || []
          })),
          { onConflict: 'user_id,dia_semana' }
        )

      if (error) throw error
      alert('✅ Agenda de Slots guardada con éxito')
    } catch (error: any) {
      alert(`Error al guardar agenda: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addSlot = (dayIndex: number) => {
    const newShed = [...weeklySchedule]
    const daySlots = [...(newShed[dayIndex].slots || [])]
    
    // Sugerir última hora + 1 hora, o 09:00 por defecto
    let nextTime = "09:00"
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1]
      const [h, m] = last.split(':').map(Number)
      nextTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    
    newShed[dayIndex].slots = [...daySlots, nextTime]
    setWeeklySchedule(newShed)
  }

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newShed = [...weeklySchedule]
    newShed[dayIndex].slots = newShed[dayIndex].slots.filter((_: any, i: number) => i !== slotIndex)
    setWeeklySchedule(newShed)
  }

  const updateSlot = (dayIndex: number, slotIndex: number, newValue: string) => {
    const newShed = [...weeklySchedule]
    newShed[dayIndex].slots[slotIndex] = newValue
    setWeeklySchedule(newShed)
  }

  const copyToAll = (dayIndex: number) => {
    const sourceSlots = [...(weeklySchedule[dayIndex].slots || [])]
    const sourceActive = weeklySchedule[dayIndex].activo
    const newShed = weeklySchedule.map(dia => ({
      ...dia,
      slots: [...sourceSlots],
      activo: sourceActive
    }))
    setWeeklySchedule(newShed)
    alert('📋 Horarios copiados a toda la semana')
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

  const diasLetras = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const getFormattedDate = () => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(new Date()).toUpperCase()
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
          
          <button 
            onClick={() => setActiveTab('programar')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'programar' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Clock className="w-5 h-5" /> Programar Agenda
          </button>

          <Link href={`/reserva/${config?.slug}`} target="_blank" className="w-full flex items-center gap-4 px-4 py-4 text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-2xl transition-all uppercase text-sm font-bold tracking-wider">
            <ExternalLink className="w-5 h-5" /> Ver Mi Web
          </Link>
          
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'config' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Mi Perfil
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
        {activeTab === 'agenda' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">HOY ES {getFormattedDate()}</h1>
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
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="font-black text-lg text-zinc-100 uppercase tracking-tight mb-1">{turn.cliente_nombre}</div>
                                <div className="text-xs text-zinc-500 font-bold flex items-center gap-2"><Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}</div>
                              </div>
                              <a 
                                href={`https://wa.me/${turn.cliente_telefono.replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-full transition-all active:scale-90"
                                title="Contactar por WhatsApp"
                              >
                                <svg 
                                  className="w-5 h-5 fill-current" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </a>
                            </div>
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
        )}

        {activeTab === 'programar' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Programar Agenda</h1>
              <p className="text-zinc-500 font-medium italic">Definí los días y horarios que vas a estar disponible</p>
            </header>

            <div className="mb-10 p-6 bg-amber-600/10 border border-amber-600/20 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="p-3 bg-amber-600 rounded-xl text-black shadow-lg shadow-amber-900/40">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-amber-500 text-sm font-black uppercase tracking-tighter leading-tight italic">
                Recordá cargar al menos un horario en los días disponibles <br className="hidden md:block" /> 
                para que tus clientes puedan reservar turnos.
              </p>
            </div>

            <div className="grid gap-6 mb-12">
              {weeklySchedule.map((dia, index) => (
                <div key={dia.dia_semana} className={`bg-zinc-900/40 border transition-all rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-8 ${dia.activo ? 'border-amber-500/20 shadow-lg' : 'border-white/5 opacity-60'}`}>
                  {/* Header del Día */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tight italic">{diasLetras[dia.dia_semana]}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${dia.activo ? 'text-amber-500' : 'text-zinc-600'}`}>
                        {dia.activo ? '🟢 Disponible para turnos' : '🔴 Local Cerrado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {dia.activo && (
                        <button 
                          onClick={() => copyToAll(index)}
                          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-zinc-600"
                        >
                          Copiar a todos
                        </button>
                      )}
                      
                      {/* Switch de Activo */}
                      <button 
                        type="button"
                        onClick={() => {
                          const newShed = [...weeklySchedule]
                          newShed[index].activo = !newShed[index].activo
                          setWeeklySchedule(newShed)
                        }}
                        className={`relative w-20 h-10 rounded-full transition-all duration-300 shadow-inner shrink-0 ${dia.activo ? 'bg-amber-600' : 'bg-zinc-800'}`}
                      >
                        <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-md ${dia.activo ? 'left-11' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Gestión de Slots */}
                  {dia.activo && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {(dia.slots || []).map((slot: string, slotIdx: number) => (
                          <div key={slotIdx} className="group relative">
                            <input 
                              type="time" 
                              value={slot} 
                              onChange={(e) => updateSlot(index, slotIdx, e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 hover:border-amber-500/30 rounded-2xl py-4 px-4 text-xl font-black text-center [color-scheme:dark] transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                            />
                            <button 
                              onClick={() => removeSlot(index, slotIdx)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => addSlot(index)}
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-800 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-2xl py-4 transition-all text-zinc-600 hover:text-amber-500"
                        >
                          <span className="text-2xl font-black">+</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Agregar</span>
                        </button>
                      </div>

                      {(dia.slots || []).length === 0 && (
                        <div className="py-12 text-center bg-zinc-950/20 rounded-[2rem] border border-dashed border-zinc-800">
                          <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No hay horarios cargados para este día</p>
                          <button 
                            onClick={() => addSlot(index)}
                            className="mt-4 text-amber-500 font-black uppercase text-[10px] underline tracking-widest"
                          >
                            Hacé clic acá para empezar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end sticky bottom-6 z-50">
              <button 
                onClick={handleUpdateSchedule}
                disabled={saving}
                className="w-full md:w-auto px-16 py-6 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-amber-900/40 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-tighter"
              >
                {saving ? 'GUARDANDO...' : '✅ GUARDAR AGENDA FLEXIBLE'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Mi Perfil</h1>
              <p className="text-zinc-500 font-medium italic">Configurá la identidad de tu negocio</p>
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
