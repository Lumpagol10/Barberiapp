'use client'

import React, { useState } from 'react'
import { X, Package, Wallet, Building2, CheckCircle2, ShoppingBag } from 'lucide-react'
import { Producto } from '@/types/dashboard'

interface VentaProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (nombre: string, precio: number, metodo: 'efectivo' | 'transferencia') => void
  products: Producto[]
  saving: boolean
}

export default function VentaProductoModal({
  isOpen,
  onClose,
  onConfirm,
  products,
  saving
}: VentaProductoModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia'>('efectivo')

  const selectedProduct = products.find(p => p.id === selectedProductId)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedProductId && !selectedProduct) return
    const price = customPrice ? Number(customPrice) : (selectedProduct?.precio || 0)
    const name = selectedProduct?.nombre || 'Producto'
    onConfirm(name, price, metodo)
    onClose()
    // Reset
    setSelectedProductId('')
    setCustomPrice('')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/20">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Venta de Producto</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Registrar salida de stock y cobro</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-800 rounded-2xl transition-all">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Selección de Producto */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Elegir Producto</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <select 
                value={selectedProductId}
                onChange={(e) => {
                    setSelectedProductId(e.target.value)
                    const p = products.find(prod => prod.id === e.target.value)
                    if (p) setCustomPrice(p.precio.toString())
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:border-amber-500 transition-all outline-none appearance-none uppercase"
              >
                <option value="">Seleccionar...</option>
                {products.filter(p => p.activo).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precio (Editable por si hay descuento) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Monto de Venta ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 font-bold">$</span>
              <input 
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-sm font-bold focus:border-amber-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMetodo('efectivo')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${metodo === 'efectivo' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950/50 border-zinc-800 text-zinc-600'}`}
            >
              <Wallet className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Efectivo</span>
            </button>
            <button 
              onClick={() => setMetodo('transferencia')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${metodo === 'transferencia' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-zinc-950/50 border-zinc-800 text-zinc-600'}`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Transf</span>
            </button>
          </div>

          <button 
            disabled={saving || !selectedProductId || !customPrice}
            onClick={handleConfirm}
            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? 'PROCESANDO...' : (
              <>
                <ShoppingBag className="w-4 h-4" /> 
                CONFIRMAR VENTA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
