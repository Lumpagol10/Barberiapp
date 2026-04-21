'use client'

import React from 'react'
import { Settings, Camera, Trash2, Type as TypeIcon, Globe, Copy, Share2, Phone, User as UserIcon, LogOut, Loader2, Store } from 'lucide-react'
import { ConfiguracionBarberia } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'
import Image from 'next/image'

interface ConfigTabProps {
  editNombre: string
  setEditNombre: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void
  editMaps: string
  setEditMaps: (val: string) => void
  editLogoUrl: string | null
  setEditLogoUrl: (val: string | null) => void
  editFidelizacionActiva: boolean
  setEditFidelizacionActiva: (val: boolean) => void
  editThreshold: number
  setEditThreshold: (val: number) => void
  editVipActivo: boolean
  setEditVipActivo: (val: boolean) => void
  onUpdateConfig: (e: React.FormEvent) => Promise<void>
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  config: ConfiguracionBarberia | null
  userEmail: string | undefined
  onLogout: () => void
  onShare: () => void
  saving: boolean
  onOpenSidebar: () => void
}

export default function ConfigTab({
  editNombre,
  setEditNombre,
  editPhone,
  setEditPhone,
  editMaps,
  setEditMaps,
  editLogoUrl,
  setEditLogoUrl,
  editFidelizacionActiva,
  setEditFidelizacionActiva,
  editThreshold,
  setEditThreshold,
  editVipActivo,
  setEditVipActivo,
  onUpdateConfig,
  onLogoUpload,
  config,
  userEmail,
  onLogout,
  onShare,
  saving,
  onOpenSidebar
}: ConfigTabProps) {
  const reservationUrl = typeof window !== 'undefined' ? `${window.location.origin}/reserva/${config?.slug}` : ''

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <DashboardHeader 
        title="Mi Perfil"
        subtitle={<p className="text-zinc-500 font-medium italic hidden md:block">Personalizá tu marca y puntos de contacto</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<Settings className="w-6 h-6" />}
      />

      <form onSubmit={onUpdateConfig} className="space-y-8 sm:space-y-10">
        {/* Branding y Logo */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
            {/* Uploader Circular Pro */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full border-4 border-amber-600/20 p-2 relative shadow-[0_0_50px_rgba(217,119,6,0.1)]">
                <div className="w-full h-full rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                  {editLogoUrl ? (
                    <img 
                      src={editLogoUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <Store className="w-12 lg:w-20 h-12 lg:h-20 text-zinc-800" />
                       <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Sin Logo</span>
                    </div>
                  )}
                  
                  {/* Overlay de Subida */}
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm border-2 border-amber-500/50 border-dashed m-1">
                    <Camera className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-tighter">Subir Logo</span>
                    <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                  </label>
                </div>

                {/* BOTONES DE CONTROL FLOTANTES */}
                <div className="absolute -top-2 -left-2 z-20">
                  <label className="bg-orange-500 p-3 rounded-full shadow-2xl shadow-orange-900/40 cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-zinc-900">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                  </label>
                </div>

                {editLogoUrl && (
                  <button 
                    type="button"
                    onClick={() => setEditLogoUrl(null)}
                    className="absolute -top-2 -right-2 bg-red-600 p-3 rounded-full shadow-2xl shadow-red-900/40 hover:scale-110 active:scale-95 transition-all z-20 border-2 border-zinc-900 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-8 w-full">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1 flex items-center gap-2">
                  <TypeIcon className="w-3 h-3" /> Nombre de la Barbería
                </label>
                <input 
                  required 
                  value={editNombre} 
                  onChange={(e) => setEditNombre(e.target.value)} 
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-6 px-8 outline-none text-white font-black text-2xl lg:text-4xl italic transition-all shadow-inner tracking-tighter placeholder:text-zinc-800" 
                  placeholder="NOMBRE DE TU NEGOCIO"
                />
              </div>

              {/* Link de Reserva Dinámico Pro */}
              <div className="bg-emerald-600/5 border border-emerald-600/10 rounded-3xl p-6 lg:p-8 space-y-5 shadow-inner">
                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Tu Link Profesional de Reservas
                 </label>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-6 py-5 text-emerald-500 font-black text-sm md:text-base truncate shadow-inner tracking-tighter">
                       {reservationUrl}
                    </div>
                    <div className="flex gap-3">
                       <button 
                          type="button"
                          onClick={() => {
                              navigator.clipboard.writeText(reservationUrl)
                              alert('✅ Link de reserva copiado')
                           }}
                          className="flex-1 sm:flex-none p-5 bg-emerald-600 text-black rounded-xl hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                          title="Copiar Link"
                       >
                          <Copy className="w-6 h-6" />
                       </button>
                       <button 
                          type="button"
                          onClick={onShare}
                          className="flex-1 sm:flex-none p-5 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700/50"
                          title="Compartir"
                       >
                          <Share2 className="w-6 h-6" />
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN FIDELIZACIÓN (NUEVA) */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings className="w-32 h-32 rotate-12" />
          </div>
          
          <div className="flex items-center gap-4 text-amber-500 relative z-10">
            <div className="p-2.5 sm:p-3 bg-amber-600/10 rounded-xl sm:rounded-2xl border border-amber-600/20">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Fidelización y Premios</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Incentivá a tus clientes a volver</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
            {/* OPCION A: CORTE GRATIS */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${editFidelizacionActiva ? 'bg-amber-600/5 border-amber-600/20 shadow-lg shadow-amber-900/5' : 'bg-zinc-950/20 border-zinc-800/50 opacity-60'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white">Programa de Puntos</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">1 Corte Gratis cada X visitas</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditFidelizacionActiva(!editFidelizacionActiva)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${editFidelizacionActiva ? 'bg-amber-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${editFidelizacionActiva ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {editFidelizacionActiva && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 ml-1">Cortes necesarios para el premio:</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="2"
                      max="20"
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(Number(e.target.value))}
                      className="flex-1 accent-amber-600 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="w-14 h-14 bg-zinc-950 border border-amber-600/30 rounded-2xl flex items-center justify-center font-black text-xl text-amber-500 shadow-inner italic">
                      {editThreshold}
                    </div>
                  </div>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase italic text-center">El cliente recibirá un aviso de regalo en su visita nº {editThreshold}, {editThreshold * 2}, etc.</p>
                </div>
              )}
            </div>

            {/* OPCION B: VIP ALERT */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${editVipActivo ? 'bg-amber-600/5 border-amber-600/20 shadow-lg shadow-amber-900/5' : 'bg-zinc-950/20 border-zinc-800/50 opacity-60'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white">Portal de Clientes VIP</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase">Identificación con diamante 💎</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditVipActivo(!editVipActivo)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${editVipActivo ? 'bg-amber-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${editVipActivo ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase leading-relaxed">
                Si está activo, verás un diamante dorado en la agenda junto a los clientes que hayan venido 3 o más veces en el último mes.
              </p>
            </div>
          </div>
        </div>

        {/* Sección Contacto */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
          <div className="flex items-center gap-4 text-emerald-500">
            <div className="p-2.5 sm:p-3 bg-emerald-600/10 rounded-xl sm:rounded-2xl"><Phone className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Canal de Ventas</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp de Reservas</label>
              <div className="flex bg-zinc-950/50 border border-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
                <div className="bg-zinc-900 px-4 sm:px-6 py-4 sm:py-5 border-r border-zinc-800 text-zinc-500 font-black text-xs sm:text-sm">+54</div>
                <input 
                  required 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))} 
                  className="flex-1 bg-transparent py-4 sm:py-5 px-5 sm:px-6 outline-none text-white font-bold text-sm sm:text-base" 
                  placeholder="2634XXXXXX"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Ubicación (Google Maps)</label>
              <input 
                value={editMaps} 
                onChange={(e) => setEditMaps(e.target.value)} 
                placeholder="Pega aquí el link de tu ubicación"
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 outline-none text-white font-bold transition-all text-sm sm:text-base" 
              />
            </div>
          </div>
        </div>

        {/* Sección Cuenta y Seguridad */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="p-2.5 sm:p-3 bg-zinc-800 rounded-xl sm:rounded-2xl"><UserIcon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Cuenta y Seguridad</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3 opacity-60">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email de la Cuenta (No Editable)</label>
              <div className="w-full bg-zinc-950/20 border border-zinc-800/50 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 text-zinc-400 font-bold text-sm sm:text-base select-none">
                {userEmail}
              </div>
            </div>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full bg-red-950/10 border border-red-900/20 hover:bg-red-900/20 text-red-500 font-black py-5 px-6 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs sm:text-sm tracking-widest italic"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión Segura
            </button>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4 sm:pt-8 sticky bottom-4 sm:relative z-40">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black font-black text-lg sm:text-xl rounded-xl sm:rounded-2xl transition-all shadow-2xl shadow-amber-900/40 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            {saving && <Loader2 className="w-6 h-6 animate-spin" />}
            {saving ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL'}
          </button>
        </div>
      </form>
    </div>
  )
}
