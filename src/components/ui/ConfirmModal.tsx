'use client'

import { LogOut, X, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'success' | 'info'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      buttonClass: 'bg-red-600 hover:bg-red-500 shadow-red-900/20',
      iconBg: 'bg-red-500/10'
    },
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20',
      iconBg: 'bg-emerald-500/10'
    },
    info: {
      icon: <LogOut className="w-8 h-8 text-amber-500" />,
      buttonClass: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20',
      iconBg: 'bg-amber-500/10'
    }
  }

  const currentType = typeConfig[type]

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900/90 border border-white/10 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors z-10"
        >
            <X className="w-5 h-5" />
        </button>
        <div className="p-8 pb-4 flex justify-between items-center">
            <div className={`p-4 rounded-3xl ${currentType.iconBg} mb-2`}>
                {currentType.icon}
            </div>
        </div>

        <div className="p-8 pt-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2 leading-tight">
            {title}
          </h2>
          <p className="text-zinc-500 text-sm font-medium italic leading-relaxed mb-8">
            {description}
          </p>
          
          <div className="flex flex-col gap-3">
            <button
                onClick={() => {
                    onConfirm()
                    onClose()
                }}
                className={`w-full py-5 rounded-2xl text-black font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${currentType.buttonClass}`}
            >
                {confirmText}
            </button>
            <button
                onClick={onClose}
                className="w-full py-5 rounded-2xl bg-zinc-800/50 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all border border-white/5"
            >
                {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
