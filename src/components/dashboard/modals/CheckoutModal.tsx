'use client'

import { DollarSign } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (omitValue: boolean) => void
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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-emerald-600/10 rounded-full mb-6 text-emerald-500">
            <DollarSign className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Finalizar y Cobrar</h2>
          <p className="text-zinc-500 mt-2 font-medium italic">Ingresa el monto del servicio para tu registro.</p>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500 group-focus-within:text-emerald-400 transition-colors">$</span>
            <input 
              type="number"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-white outline-none transition-all placeholder:text-zinc-800"
            />
          </div>

          <div className="grid gap-3">
            <button 
              onClick={() => onConfirm(false)}
              disabled={saving || !price}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-tighter"
            >
              {saving ? 'PROCESANDO...' : 'CONFIRMAR Y GUARDAR'}
            </button>
            <button 
              onClick={() => onConfirm(true)}
              disabled={saving}
              className="w-full py-4 text-zinc-500 hover:text-white font-black text-sm uppercase tracking-widest transition-colors"
            >
              OMITIR MONTO
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
