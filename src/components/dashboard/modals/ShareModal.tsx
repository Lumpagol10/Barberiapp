'use client'

import { LogOut, MessageCircle, Copy, ExternalLink } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onShareWhatsApp: () => void
  onCopyLink: () => void
  onShareNative: () => void
}

export default function ShareModal({
  isOpen,
  onClose,
  onShareWhatsApp,
  onCopyLink,
  onShareNative
}: ShareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900/90 border border-white/10 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Compartir Agenda</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-all">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-4">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6 italic leading-relaxed text-center">
            Elegí el medio para invitar a tus clientes
          </p>
          
          <button 
            onClick={onShareWhatsApp}
            className="w-full flex items-center gap-4 p-5 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="block text-white font-bold uppercase tracking-tight text-sm">WhatsApp</span>
              <span className="block text-[#25D366] text-[10px] font-bold uppercase tracking-widest opacity-80">Enviar mensaje pro</span>
            </div>
          </button>

          <button 
            onClick={onCopyLink}
            className="w-full flex items-center gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform">
              <Copy className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="block text-white font-bold uppercase tracking-tight text-sm">Copiar Link</span>
              <span className="block text-amber-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Link de reserva online</span>
            </div>
          </button>

          <div className="pt-6 flex flex-col items-center gap-4 border-t border-white/5">
            <button 
              onClick={onShareNative}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Otras opciones del sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
