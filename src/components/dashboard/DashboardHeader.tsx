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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 mb-6 md:mb-12 lg:mb-16 w-full max-w-full overflow-x-hidden">
      {/* Contenedor Principal Adaptativo */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
        
        {/* FILA 1: MARCA (Logo + Nombre) - OCULTO EN DESKTOP por redundancia con Sidebar */}
        <div className="flex lg:hidden flex-row items-center justify-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 flex items-center justify-center overflow-hidden relative">
            {config?.logo_url ? (
              <Image 
                src={config.logo_url} 
                alt="Logo" 
                fill 
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 56px, 80px"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center rounded-xl">
                <Store className="w-5 h-5 text-zinc-600" />
              </div>
            )}
          </div>
          <span className="text-xl md:text-3xl font-bold tracking-tighter uppercase italic text-white truncate max-w-[60vw] md:max-w-none">
            {config?.nombre_barberia}
          </span>
        </div>

        {/* FILA 2: FECHA Y SUBTITULO */}
        <div className="flex flex-col items-center md:items-start space-y-0.5 w-full md:w-auto">
          {/* Título de Fecha - Más compacto en mobile */}
          <h1 className="text-base sm:text-md md:text-4xl font-black tracking-tighter uppercase italic leading-tight text-amber-500 md:text-zinc-100 text-center md:text-left">
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

      {/* FILA 3: PENDIENTES (Stats) - Flat Design */}
      {showStats && (
        <div className="flex justify-center w-full md:w-auto">
          <div className="p-2 sm:p-0 min-w-[130px] flex flex-col items-center md:items-start group transition-all text-center md:text-left">
            <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1">{statsLabel}</p>
            <div className="flex items-end gap-1.5 md:gap-2">
              <span className="text-xl md:text-4xl font-black text-amber-500 leading-none">{statsValue}</span>
              <Users className="w-3.5 h-3.5 md:w-5 h-5 text-zinc-700 group-hover:text-amber-500 transition-colors mb-0.5 md:mb-1" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
