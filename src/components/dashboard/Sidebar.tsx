'use client'

import { Calendar, DollarSign, Settings, Clock, LogOut, User as UserIcon, Store, X } from 'lucide-react'
import { DashboardTab, ConfiguracionBarberia } from '@/types/dashboard'
import Image from 'next/image'

interface SidebarProps {
  activeTab: DashboardTab
  setActiveTab: (tab: DashboardTab) => void
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (open: boolean) => void
  config: ConfiguracionBarberia | null
  userEmail: string | undefined
  setShowLogoutModal: (show: boolean) => void
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  config,
  userEmail,
  setShowLogoutModal,
}: SidebarProps) {
  
  const menuItems = [
    { id: 'agenda' as DashboardTab, label: 'Turnos Hoy', icon: Calendar },
    { id: 'programar' as DashboardTab, label: 'Programar Agenda', icon: Clock },
    { id: 'finanzas' as DashboardTab, label: 'Finanzas', icon: DollarSign, color: 'emerald' },
    { id: 'config' as DashboardTab, label: 'Mi Perfil', icon: Settings },
  ]

  return (
    <>
      {/* Overlay para cerrar Sidebar en Mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ahora Drawer en Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-80 flex flex-col bg-zinc-950 lg:bg-zinc-900/50 border-r border-zinc-800/50 p-6 backdrop-blur-md z-50 transition-transform duration-300 min-h-screen lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl shadow-lg shrink-0 flex items-center justify-center overflow-hidden border border-amber-500/20 bg-zinc-900 relative">
              {config?.logo_url ? (
                <Image src={config.logo_url} alt="Logo" fill className="object-cover" sizes="48px" unoptimized />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                  <Store className="w-6 h-6 text-zinc-500" />
                </div>
              )}
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic truncate flex-1 min-w-0 text-white">
              {config?.nombre_barberia || 'BARBERIAPP'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isEmerald = item.color === 'emerald'
            
            return (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${
                  isActive 
                    ? isEmerald ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-600/10 text-amber-500 border-amber-500/10' 
                    : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" /> {item.label}
              </button>
            )
          })}
        </nav>

        {/* Elite Session Footer */}
        <div className="mt-auto pt-6 border-t border-zinc-800/50 space-y-4">
          <div className="bg-zinc-800/30 rounded-3xl p-4 border border-zinc-800/50 flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Usuario</span>
                <span className="text-xs font-bold text-zinc-300 truncate">{userEmail}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all uppercase text-[10px] tracking-widest"
            >
              <LogOut className="w-4 h-4" /> SALIR DEL PANEL
            </button>
          </div>
        </div>
      </aside>

      {/* Navegación Mobile Compacta (Bottom Nav) */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 px-3 py-2 rounded-full flex items-center gap-1 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isEmerald = item.color === 'emerald'

          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`p-3 rounded-full transition-all ${
                isActive 
                  ? isEmerald ? 'bg-emerald-600 text-black' : 'bg-amber-600 text-black' 
                  : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </nav>
    </>
  )
}
