'use client'

import React, { useState, useEffect } from 'react'
import { X, UserPlus, Phone, UserCheck } from 'lucide-react'

interface RegisterClientModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (nombre: string, telefono: string) => void
  initialName: string
  initialPhone: string
  saving: boolean
}

export default function RegisterClientModal({
  isOpen,
  onClose,
  onConfirm,
  initialName,
  initialPhone,
  saving
}: RegisterClientModalProps) {
  const [nombre, setNombre] = useState(initialName)
  const [telefono, setTelefono] = useState(initialPhone)

  // Sincronizar con props cuando abrimos el modal
  useEffect(() => {
    if (isOpen) {
      setNombre(initialName.toUpperCase())
      setTelefono(initialPhone)
    }
  }, [isOpen, initialName, initialPhone])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-[#0c0c0c] w-full max-w-md border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        
        {/* BOTÓN X DE CIERRE ESTANDARIZADO */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10">
          {/* ICONO HEADER */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shadow-inner">
              <UserPlus className="w-10 h-10" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Nuevo Cliente</h2>
            <p className="text-zinc-500 text-sm font-medium italic">Registrá este contacto para habilitar su historial y fidelización.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onConfirm(nombre, telefono); }} className="space-y-6">
            <div className="space-y-4">
              {/* CAMPO NOMBRE */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.toUpperCase())}
                  placeholder="NOMBRE DEL CLIENTE"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-white placeholder:text-zinc-700 outline-none focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10 transition-all uppercase"
                  required
                />
              </div>

              {/* CAMPO TELÉFONO */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="TELÉFONO"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-white placeholder:text-zinc-700 outline-none focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black text-sm rounded-2xl transition-all shadow-xl shadow-amber-950/20 flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98]"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    GUARDAR CLIENTE
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DECORACIÓN FONDO */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
