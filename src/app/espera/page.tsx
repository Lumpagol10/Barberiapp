'use client'

import { Scissors, MessageCircle, LogOut, ShieldCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function EsperaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/admin/auth')
  }

  // Si por alguna razón el usuario se activa mientras está en esta página, 
  // una recarga o verificación manual podría llevarlo al dashboard.
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('authorized')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.authorized) {
          router.push('/dashboard')
        }
      }
    };
    const interval = setInterval(checkAuth, 10000); // Re-verificar cada 10s
    return () => clearInterval(interval);
  }, [router])

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Fondo con Brillo de Marca */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-12">
        {/* Logo Icon */}
        <div className="inline-block p-6 bg-zinc-900/80 border border-white/5 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-700">
          <div className="relative">
            <Scissors className="w-16 h-16 text-amber-500" />
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <ShieldCheck className="relative inline-flex h-5 w-5 text-amber-500 bg-zinc-900 rounded-full" />
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje Principal */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            ¡Excelente! Tu barbería está a un paso.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto">
            Franmark Digital está verificando tu cuenta para asegurar la excelencia de nuestra red.
          </p>
        </div>

        {/* Acción Principal: WhatsApp */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <a
            href="https://wa.me/542634514339?text=Hola!%20Acabo%20de%20crear%20mi%20cuenta%20en%20Barberiapp%20y%20estoy%20esperando%20la%20aprobación."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-4 w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-emerald-900/20 active:scale-95"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            NOTIFICAR POR WHATSAPP
          </a>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
            Acelerá tu aprobación enviándonos un mensaje directo
          </p>
        </div>

        {/* Acción Secundaria: Logout */}
        <div className="pt-8 animate-in fade-in duration-1000 delay-500">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Entrar con otra cuenta
          </button>
        </div>

        <footer className="pt-12">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">
            Protocolo de Seguridad <span className="text-zinc-500">Franmark Digital</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
