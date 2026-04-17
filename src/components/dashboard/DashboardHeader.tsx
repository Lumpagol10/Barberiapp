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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 mb-6 md:mb-12 lg:mb-16">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl border-2 border-amber-500/20 p-1.5 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden bg-zinc-900/50 backdrop-blur-sm relative">
          {config?.logo_url ? (
            <Image src={config.logo_url} alt="Logo" fill className="object-cover rounded-2xl" sizes="(max-width: 768px) 64px, 96px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center rounded-2xl">
              <Store className="w-10 h-10 text-zinc-600" />
            </div>
          )}
        </div>
        
        {/* Menú Hamburguesa (Desktop Only - per user request to hide on mobile) */}
        <button 
          onClick={onOpenSidebar}
          className="hidden lg:flex p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-amber-500 shadow-xl active:scale-95 transition-all"
        >
          {icon || <Scissors className="w-6 h-6 rotate-90" />}
        </button>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-lg sm:text-xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic leading-tight">{title}</h1>
          <div className="hidden md:flex items-center gap-4">
            {subtitle || (
               <p className="text-zinc-500 text-xs sm:text-base font-medium italic">
                 Gestión operativa <span className="hidden lg:inline-block">para <span className="text-amber-500 font-bold truncate max-w-[200px] inline-block align-bottom">{config?.nombre_barberia}</span></span>
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

      {showStats && (
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] min-w-[120px] md:min-w-[140px] shadow-xl">
          <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">{statsLabel}</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl md:text-4xl font-black text-amber-500 leading-none">{statsValue}</span>
            <Users className="w-4 h-4 md:w-5 h-5 text-zinc-700 mb-0.5 md:mb-1" />
          </div>
        </div>
      )}
    </header>
  )
}
