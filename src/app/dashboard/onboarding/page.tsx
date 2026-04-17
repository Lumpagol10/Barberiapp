'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Scissors, Globe, Phone, Type, ArrowRight, Loader2 } from 'lucide-react'

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [nombreBarberia, setNombreBarberia] = useState('')
  const [slug, setSlug] = useState('')
  const [phone, setPhone] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/auth')
        return
      }
      
      // Verificar si ya tiene configuración
      const { data: config } = await supabase
        .from('configuracion_barberia')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (config) {
        router.push('/dashboard')
      } else {
        setUser(user)
        setChecking(false)
      }
    }
    checkStatus()
  }, [])

  // Generación automática de slug al escribir el nombre
  const handleNameChange = (val: string) => {
    setNombreBarberia(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos por un solo guión
      .replace(/^-+|-+$/g, '')  // Eliminar guiones al inicio o final
    setSlug(generatedSlug)
  }

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('configuracion_barberia')
        .insert([{
          user_id: user.id,
          nombre_barberia: nombreBarberia,
          slug: slug,
          telefono_barbero: phone,
        }])

      if (error) throw error
      router.push('/dashboard')
    } catch (error: any) {
      alert(`Error al guardar configuración: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />

      <div className="max-w-xl w-full relative z-10">
        <header className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block p-4 bg-amber-600 rounded-3xl shadow-2xl shadow-amber-900/40 mb-6">
            <Scissors className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">¡Hagámoslo realidad!</h1>
          <p className="text-zinc-500 text-lg">Configura tu local para empezar a recibir turnos hoy mismo.</p>
        </header>

        <form onSubmit={handleOnboarding} className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] space-y-8 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Type className="w-4 h-4" /> Nombre del Local
            </label>
            <input
              required
              value={nombreBarberia}
              onChange={(e) => handleNameChange(e.target.value)}
              type="text"
              placeholder="Ej: Barbería de Franco"
              className="w-full bg-zinc-800/40 border border-zinc-700/50 focus:border-amber-500 rounded-2xl py-5 px-6 outline-none transition-all placeholder:text-zinc-700 text-lg font-medium"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Tu URL personalizada
            </label>
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5">
              <span className="text-zinc-600 font-bold whitespace-nowrap">barberiapp/reserva/</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                type="text"
                className="bg-transparent border-none outline-none text-amber-500 font-bold flex-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> WhatsApp para Turnos
            </label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="5492634XXXXXX"
                className="w-full bg-zinc-800/40 border border-zinc-700/50 focus:border-amber-500 rounded-2xl py-5 pl-16 pr-6 outline-none transition-all placeholder:text-zinc-700 text-lg font-medium"
              />
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1 italic">
              * Incluí código de país (Ej: 54 para Argentina)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !slug}
            className="group w-full py-5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xl rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Lanzar mi Barbería
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-12 text-center">
          <p className="text-zinc-600 text-sm font-medium uppercase tracking-[0.2em]">
            Powered by <span className="text-zinc-500 font-bold">Franmark Digital</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
