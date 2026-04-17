'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, LogOut, Scissors, Users, Calendar, TrendingUp, Settings, ExternalLink, Phone, Clock, Type } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [turns, setTurns] = useState<any[]>([])
  const router = useRouter()

  // Onboarding Form States
  const [nombreBarberia, setNombreBarberia] = useState('')
  const [slug, setSlug] = useState('')
  const [phone, setPhone] = useState('')

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
      // 1. Cargar Configuración
      const { data: configData } = await supabase
        .from('configuracion_barberia')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (configData) {
        setConfig(configData)
        // 2. Cargar Turnos si hay config
        const { data: turnsData } = await supabase
          .from('turnos')
          .select('*')
          .eq('barbero_id', userId)
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true })
        
        setTurns(turnsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('configuracion_barberia')
        .insert([{
          user_id: user.id,
          nombre_barberia: nombreBarberia,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          telefono_barbero: phone,
        }])
        .select()
        .single()

      if (error) throw error
      setConfig(data)
    } catch (error: any) {
      alert(`Error en el alta: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async (id: string) => {
    const { error } = await supabase.from('turnos').delete().eq('id', id)
    if (!error) {
      setTurns(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/auth')
  }

  if (loading && !user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>

  // PANTALLA DE ONBOARDING
  if (!loading && !config) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-xl w-full">
          <header className="text-center mb-10">
            <div className="inline-block p-4 bg-amber-600 rounded-3xl shadow-2xl shadow-amber-900/20 mb-6">
              <Scissors className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Bienvenido a Barberiapp</h1>
            <p className="text-zinc-500 text-lg">Configura tu local para empezar a recibir turnos</p>
          </header>

          <form onSubmit={handleOnboarding} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 backdrop-blur-xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 ml-1 flex items-center gap-2 italic uppercase tracking-wider"><Type className="w-4 h-4" /> Nombre del Local</label>
              <input required value={nombreBarberia} onChange={(e) => setNombreBarberia(e.target.value)} type="text" placeholder="Ej: King's Barber Shop" className="w-full bg-zinc-800/40 border border-zinc-700/50 focus:border-amber-500 rounded-2xl py-4 px-6 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 ml-1 flex items-center gap-2 italic uppercase tracking-wider"><ExternalLink className="w-4 h-4" /> URL deseada (Slug)</label>
              <div className="flex items-center gap-2 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl px-6 py-4 focus-within:border-amber-500 transition-all">
                <span className="text-zinc-500">/reserva/</span>
                <input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} type="text" placeholder="mi-barberia" className="bg-transparent outline-none flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 ml-1 flex items-center gap-2 italic uppercase tracking-wider"><Phone className="w-4 h-4" /> WhatsApp de Notificación</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="5492634..." className="w-full bg-zinc-800/40 border border-zinc-700/50 focus:border-amber-500 rounded-2xl py-4 px-6 outline-none transition-all" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xl rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tighter">
              {loading ? <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" /> : 'CONSTRUIR MI BARBERÍA'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex pb-12 font-sans">
      <aside className="hidden lg:flex w-72 flex-col bg-zinc-900/50 border-r border-zinc-800/50 p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 bg-amber-600 rounded-xl shadow-lg shadow-amber-900/20">
            <Scissors className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">{config?.nombre_barberia || 'BARBERIAPP'}</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-4 px-4 py-4 bg-amber-600/10 text-amber-500 rounded-2xl font-bold transition-all border border-amber-500/10 uppercase text-sm tracking-wider">
            <Calendar className="w-5 h-5" /> Turnos Hoy
          </button>
          <Link href={`/reserva/${config?.slug}`} target="_blank" className="w-full flex items-center gap-4 px-4 py-4 text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-2xl transition-all uppercase text-sm font-bold tracking-wider">
            <ExternalLink className="w-5 h-5" /> Ver Mi Web
          </Link>
          <button className="w-full flex items-center gap-4 px-4 py-4 text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-2xl transition-all uppercase text-sm font-bold tracking-wider opacity-50 cursor-not-allowed">
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors mt-auto font-bold uppercase text-xs tracking-widest">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Mi Agenda</h1>
            <p className="text-zinc-500 font-medium italic">Gestión operativa para <span className="text-amber-500 font-bold">{config?.nombre_barberia}</span></p>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2rem] min-w-[140px] shadow-xl">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Pendientes</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-amber-500 leading-none">{turns.length}</span>
                <Users className="w-5 h-5 text-zinc-700 mb-1" />
              </div>
            </div>
          </div>
        </header>

        <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Próximos Turnos</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Updates</span>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 text-amber-500 rounded-xl font-mono font-black border border-amber-600/10 shadow-inner">
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
                      <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter">Sin Turnos</div>
                      <p className="text-zinc-600 font-medium italic">No hay más turnos pendientes. ¡Buen trabajo!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
