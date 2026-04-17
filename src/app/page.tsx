import { Scissors, ArrowRight, CheckCircle2, Globe, Phone, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-900/5 rounded-full blur-[150px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <header className="mb-12 inline-block">
            <div className="flex items-center justify-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-4 bg-amber-600 rounded-3xl shadow-2xl shadow-amber-900/40">
                <Scissors className="w-10 h-10 text-black" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic">Barberiapp</span>
            </div>
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4">
              DALE EL LOOK QUE TU <span className="text-amber-500">BARBERÍA</span> AMERITA.
            </h1>
            <p className="text-zinc-400 text-base sm:text-xl md:text-2xl font-medium max-w-3xl mx-auto mb-10 leading-relaxed italic animate-in fade-in slide-in-from-bottom-12 duration-1000 px-6">
              Gestión de turnos inteligente para profesionales que no pierden el tiempo. Unite a la red de Franmark Digital.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-[60px] duration-1000">
            <Link 
              href="/admin/auth" 
              className="group relative px-10 py-6 bg-amber-600 hover:bg-amber-500 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-amber-900/20 active:scale-95 flex items-center gap-3 uppercase tracking-tighter"
            >
              Comenzar ahora 
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 px-6 py-4 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                Partner de Franmark Digital
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[3rem] hover:border-amber-500/30 transition-all group">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 transition-colors">
                <Globe className="w-7 h-7 text-amber-500 group-hover:text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Tu propia URL</h3>
              <p className="text-zinc-500 leading-relaxed">Cada barbero obtiene un link único (ej: barberiapp.com/reserva/tu-estilo) para compartir en Instagram y redes.</p>
            </div>

            <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[3rem] hover:border-amber-500/30 transition-all group">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 transition-colors">
                <Phone className="w-7 h-7 text-amber-500 group-hover:text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">WhatsApp Integrado</h3>
              <p className="text-zinc-500 leading-relaxed">Recibí una notificación directa al móvil por cada turno nuevo con el detalle completo del cliente.</p>
            </div>

            <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[3rem] hover:border-amber-500/30 transition-all group">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 transition-colors">
                <ShieldCheck className="w-7 h-7 text-amber-500 group-hover:text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Control Total</h3>
              <p className="text-zinc-500 leading-relaxed">Administrá tus horarios de apertura, cierre e intervalos de corte de forma simple desde tu panel de control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Footer */}
      <footer className="py-20 text-center border-t border-white/5">
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Utilizado por +40 barberías en Argentina</p>
        </div>
        <p className="text-zinc-600 text-sm">
          © 2024 Barberiapp. Una solución de <span className="text-zinc-400 font-bold tracking-tighter">Franmark Digital</span>.
        </p>
      </footer>
    </div>
  )
}
