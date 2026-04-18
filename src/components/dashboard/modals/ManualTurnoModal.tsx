'use client'

import { useState, useEffect } from 'react'
import { User, Scissors, DollarSign, Clock, X } from 'lucide-react'

interface ManualTurnoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { nombre: string; servicio: string; precio: number; hora: string }) => void
  saving: boolean
}

export default function ManualTurnoModal({
  isOpen,
  onClose,
  onConfirm,
  saving
}: ManualTurnoModalProps) {
  const [nombre, setNombre] = useState('')
  const [servicio, setServicio] = useState('')
  const [precio, setPrecio] = useState('')
  const [hora, setHora] = useState('')

  // Auto-completar hora actual al abrir
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const argTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now)
      setHora(argTime)
      // Reset otros campos
      setNombre('')
      setServicio('')
      setPrecio('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !precio || !hora) return
    onConfirm({
      nombre,
      servicio,
      precio: Number(precio),
      hora: `${hora}:00`
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/5 w-full max-w-lg rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Glow Decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Registro Express</h2>
              <p className="text-orange-500/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Nuevo Turno Manual</p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-3 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del Cliente */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre del Cliente</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  required
                  type="text"
                  placeholder="Ej: Marcelo Salas"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-orange-500/40 rounded-2xl py-5 pl-14 pr-6 text-white outline-none transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Fila: Servicio y Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Servicio (Opcional)</label>
                <div className="relative group">
                  <Scissors className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Ej: Corte + Barba"
                    value={servicio}
                    onChange={(e) => setServicio(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-orange-500/40 rounded-2xl py-5 pl-14 pr-6 text-white outline-none transition-all placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Precio / Cobro</label>
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  <input 
                    required
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/40 rounded-2xl py-5 pl-14 pr-6 text-white text-xl font-black outline-none transition-all placeholder:text-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Hora de Atención</label>
              <div className="relative group">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  required
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-orange-500/40 rounded-2xl py-5 pl-14 pr-6 text-white font-bold outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving || !nombre || !precio || !hora}
              className="w-full py-6 mt-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-[1.5rem] transition-all shadow-xl shadow-orange-900/20 active:scale-95 uppercase tracking-tighter"
            >
              {saving ? 'REGISTRANDO...' : 'CONFIRMAR Y COBRAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
