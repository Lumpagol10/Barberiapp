'use client'

import { Scissors, Share2, Store, Users } from 'lucide-react'
import { ConfiguracionBarberia } from '@/types/dashboard'
import Image from 'next/image'

interface DashboardHeaderProps {
  title: string
  subtitle?: React.ReactNode
  config: ConfiguracionBarberia | null
  onOpenSidebar: () => void
  onShare?: () => void
  showStats?: boolean
  statsValue?: number
  statsLabel?: string
  icon?: React.ReactNode
}

export default function DashboardHeader({
  title,
  subtitle,
  config,
  onOpenSidebar,
  onShare,
  showStats,
  statsValue,
  statsLabel,
  icon
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 lg:mb-16">
      {/* Contenedor Principal (Mobile: Vertical | Desktop: Horizontal) */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto">
        
        {/* FILA 1: MARCA (Logo + Nombre) - Centrado en Mobile */}
        <div className="flex flex-row items-center justify-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl border border-amber-500/20 p-1 shadow-xl shrink-0 flex items-center justify-center overflow-hidden bg-zinc-900 relative">
            {config?.logo_url ? (
              /* Usamos <img> nativo para asegurar la carga inmediata y saltar restricciones de next/image */
              <img 
                src={config.logo_url} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center rounded-xl">
                <Store className="w-6 h-6 text-zinc-600" />
              </div>
            )}
          </div>
          <span className="text-xl md:text-3xl font-black tracking-tighter uppercase italic text-white md:hidden">
            {config?.nombre_barberia}
          </span>
        </div>

        {/* FILA 2: FECHA Y SUBTITULO */}
        <div className="flex flex-col items-center md:items-start space-y-2 w-full md:w-auto">
          {/* Título de Fecha (Centrado y tamaño normal en mobile) */}
          <h1 className="text-md sm:text-lg md:text-4xl font-black tracking-tighter uppercase italic leading-tight text-amber-500 md:text-zinc-100 text-center md:text-left">
            {title}
          </h1>
          
          <div className="hidden md:flex items-center gap-4">
            {subtitle || (
               <p className="text-zinc-500 text-xs sm:text-base font-medium italic">
                 Gestión operativa para <span className="text-amber-500 font-bold">{config?.nombre_barberia}</span>
               </p>
            )}
            {onShare && (
              <button 
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir Link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILA 3: PENDIENTES (Stats) - Centrado en Mobile */}
      {showStats && (
        <div className="flex justify-center w-full md:w-auto">
          <div className="bg-zinc-900/80 border border-zinc-800 p-3 sm:p-5 rounded-3xl min-w-[120px] md:min-w-[140px] shadow-xl flex flex-col items-center md:items-start">
            <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">{statsLabel}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-4xl font-black text-amber-500 leading-none">{statsValue}</span>
              <Users className="w-4 h-4 md:w-5 h-5 text-zinc-700 mb-0.5 md:mb-1" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
