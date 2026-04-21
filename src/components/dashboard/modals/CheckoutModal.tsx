'use client'

import { DollarSign, Wallet, Building2, Ticket } from 'lucide-react'
import { useState } from 'react'

export type PaymentMethod = 'efectivo' | 'transferencia' | null

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (omitValue: boolean, method: PaymentMethod, desc: string) => void
  price: string
  setPrice: (price: string) => void
  saving: boolean
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onConfirm,
  price,
  setPrice,
  saving
}: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>(null)
  const [desc, setDesc] = useState('')

  if (!isOpen) return null

  const handleConfirm = (omit: boolean) => {
    onConfirm(omit, method, desc)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="p-4 bg-emerald-600/10 rounded-full mb-4 sm:mb-6 text-emerald-500">
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Cerrar Turno</h2>
          <p className="text-zinc-500 mt-2 font-medium italic text-xs sm:text-sm">Registrá el pago y el servicio realizado.</p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          
          {/* MÉTODO DE PAGO (CHIPS PREMIUM) */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setMethod('efectivo')}
              className={`py-3 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${method === 'efectivo' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-900/20' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">EFECTIVO</span>
            </button>
            <button 
              onClick={() => setMethod('transferencia')}
              className={`py-3 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${method === 'transferencia' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-900/20' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">TRANSF.</span>
            </button>
          </div>

          {/* DESCRIPCIÓN DEL SERVICIO */}
          <div>
            <div className="relative group">
              <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="Ej: Corte + Barba + Cejas"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* PRECIO */}
          <div className="relative group mt-2">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500 group-focus-within:text-emerald-400 transition-colors">$</span>
            <input 
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-white outline-none transition-all placeholder:text-zinc-800"
            />
          </div>

          {/* ACCIONES */}
          <div className="grid gap-3 pt-2">
            <button 
              onClick={() => handleConfirm(false)}
              disabled={saving || !price || !method}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:grayscale text-black font-black text-lg sm:text-xl rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-tighter"
            >
              {saving ? 'GUARDANDO...' : 'CONFIRMAR CIERRE'}
            </button>
            <button 
              onClick={() => handleConfirm(true)}
              disabled={saving}
              className="w-full py-4 text-zinc-500 hover:text-white font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
            >
              OMITIR VALORES (Turno Gratis)
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-zinc-700 hover:text-zinc-500 font-bold text-xs uppercase tracking-widest transition-colors mt-2"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
