'use client'

import { useState } from 'react'
import { Scissors, Clock, Phone, User, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simular envío de reserva
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-amber-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white">¡Turno Reservado!</h2>
          <p className="text-zinc-400 text-lg">
            Gracias por elegir <span className="text-amber-500 font-semibold">Barberiapp</span>. Te esperamos en la hora seleccionada.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20"
          >
            Nueva Reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />

      <header className="mb-12 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-900/30">
            <Scissors className="w-8 h-8 text-black" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl mb-2">
          BARBERI<span className="text-amber-500 text-6xl">APP</span>
        </h1>
        <p className="text-zinc-400 text-lg font-light tracking-wide">PROFESSIONAL GROOMING EXPERIENCE</p>
      </header>

      <main className="w-full max-w-lg relative z-10">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-2xl font-semibold mb-8 text-center text-zinc-200">Reserva tu Turno</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type="tel"
                  placeholder="+54 11 1234 5678"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Hora del Turno</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type="time"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white appearance-none"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-lg rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-amber-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                'CONFIRMAR RESERVA'
              )}
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Powered by <span className="text-zinc-400 font-semibold tracking-tighter">Franmark Digital</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
