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
  const [phoneSuffix, setPhoneSuffix] = useState('')
  const [googleMaps, setGoogleMaps] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/auth')
        return
      }
      
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

  const handleNameChange = (val: string) => {
    setNombreBarberia(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug)
  }

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreBarberia || !slug) return

    setLoading(true)
    try {
      const fullPhone = `54${phoneSuffix}`
      const { error } = await supabase
        .from('configuracion_barberia')
        .insert([{
          user_id: user.id,
          nombre_barberia: nombreBarberia,
          slug: slug,
          telefono_barbero: fullPhone,
          google_maps_link: googleMaps || null
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />

      <div className="max-w-xl w-full relative z-10">
        <header className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-block p-4 bg-amber-600 rounded-3xl shadow-2xl shadow-amber-900/20 mb-6">
            <Scissors className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Configuración SaaS</h1>
          <p className="text-zinc-500 text-lg">Ajustes de precisión para tu barbería</p>
        </header>

        <form onSubmit={handleOnboarding} className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] space-y-7 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> Nombre Oficial del Local *
            </label>
            <input
              required
              value={nombreBarberia}
              onChange={(e) => handleNameChange(e.target.value)}
              type="text"
              placeholder="Ej: Barbería de Franco"
              className="w-full bg-zinc-800/40 border border-zinc-700/50 focus:border-amber-500 rounded-2xl py-4.5 px-6 outline-none transition-all placeholder:text-zinc-700 font-bold"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Link de Reserva (Auto-generado)
            </label>
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4.5">
              <span className="text-zinc-600 font-black text-xs whitespace-nowrap">/reserva/</span>
              <input
                disabled
                value={slug}
                type="text"
                className="bg-transparent border-none outline-none text-amber-500 font-black flex-1"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> WhatsApp (Prefijo 54 fijo)
            </label>
            <div className="flex items-center bg-zinc-800/40 border border-zinc-700/50 focus-within:border-amber-500 rounded-2xl overflow-hidden transition-all">
              <div className="bg-zinc-800 px-5 py-4.5 border-r border-zinc-700/50 text-zinc-400 font-black">
                54
              </div>
              <input
                required
                value={phoneSuffix}
                onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, ''))}
                type="tel"
                placeholder="2634XXXXXX"
                className="flex-1 bg-transparent py-4.5 px-6 outline-none text-white font-bold placeholder:text-zinc-700"
              />
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1">
              Ejemplos: 2634XXXXXX o 261XXXXXXX (Sin el 15 ni el 0)
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Link Google Maps (Opcional)
            </label>
            <input
              value={googleMaps}
              onChange={(e) => setGoogleMaps(e.target.value)}
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              className="w-full bg-zinc-800/20 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-4.5 px-6 outline-none transition-all placeholder:text-zinc-800 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !nombreBarberia || !phoneSuffix}
            className="group w-full py-5 bg-amber-600 hover:bg-amber-500 text-black font-black text-lg rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tighter disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Finalizar y Lanzar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
