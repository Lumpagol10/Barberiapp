import { ShieldAlert, Clock, Mail } from 'lucide-react'

export default function Espera() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-amber-600 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <ShieldAlert className="w-16 h-16 text-amber-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Acceso en Revisión</h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Tu cuenta aún no ha sido autorizada por el equipo de <span className="text-zinc-300 font-semibold">Franmark Digital</span>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3">
            <Clock className="w-6 h-6 text-amber-500/50" />
            <div className="text-sm">
              <p className="font-semibold text-zinc-300">Tiempo de espera</p>
              <p className="text-zinc-500">Normalmente 24/48hs</p>
            </div>
          </div>
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3">
            <Mail className="w-6 h-6 text-amber-500/50" />
            <div className="text-sm">
              <p className="font-semibold text-zinc-300">Contacto</p>
              <p className="text-amber-600 font-medium">soporte@franmark.com</p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <a
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            ← Volver al Inicio
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0">
        <p className="text-zinc-800 font-black text-6xl tracking-tighter opacity-10 select-none">
          FRANMARK DIGITAL
        </p>
      </div>
    </div>
  )
}
