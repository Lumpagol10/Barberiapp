'use client'

import React, { useState } from 'react'
import { Calendar, Settings, Scissors } from 'lucide-react'
import { HorarioRutina, HorarioEspecifico, ConfiguracionBarberia } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'

interface ProgramarTabProps {
  planningSchedule: HorarioEspecifico[]
  setPlanningSchedule: (planning: HorarioEspecifico[]) => void
  onUpdatePlanning: () => void
  copyRoutineToPlanning: (idx: number) => void
  addPlanningSlot: (idx: number) => void
  removePlanningSlot: (dayIdx: number, slotIdx: number) => void
  updatePlanningSlot: (dayIdx: number, slotIdx: number, newValue: string) => void
  saving: boolean
  config: ConfiguracionBarberia | null
  onOpenSidebar: () => void
}

export default function ProgramarTab({
  planningSchedule,
  setPlanningSchedule,
  onUpdatePlanning,
  copyRoutineToPlanning,
  addPlanningSlot,
  removePlanningSlot,
  updatePlanningSlot,
  saving,
  config,
  onOpenSidebar
}: ProgramarTabProps) {
  const [showMasterRoutine, setShowMasterRoutine] = useState(false)
  const diasLetras = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl pb-24 lg:pb-0">
      <DashboardHeader 
        title="Agenda Semanal"
        subtitle={<p className="text-zinc-500 font-medium italic hidden md:block">Confirmá los días que vas a trabajar esta semana</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<Scissors className="w-6 h-6 rotate-90" />}
      />

      {/* SECCIÓN RUTINA MAESTRA ELIMINADA POR USUARIO */}

      <div className="mb-10 p-6 bg-amber-600/10 border border-amber-600/20 rounded-[2rem] flex items-center gap-4">
        <div className="p-3 bg-amber-600 rounded-xl text-black shadow-lg shadow-amber-900/40">
          <Calendar className="w-5 h-5" />
        </div>
        <p className="text-amber-500 text-sm font-black uppercase tracking-tighter leading-tight italic">
          Solo los días que marques como &quot;ACTIVOS&quot; y guardes serán visibles para tus clientes en la web de reserva.
        </p>
      </div>

      <div className="grid gap-6 mb-12">
        {planningSchedule.map((dia, idx) => (
          <div key={dia.fecha} className={`transition-all py-10 lg:py-16 flex flex-col gap-8 border-b border-zinc-800/50 ${dia.activo ? 'opacity-100' : 'opacity-40'}`}>
            {/* Header del Día */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black uppercase tracking-tight italic">
                    {diasLetras[new Date(dia.fecha + 'T12:00:00').getDay()]} {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </h3>
                  {dia.fecha === new Date().toLocaleDateString('en-CA') && (
                    <span className="px-3 py-1 bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-900/40 animate-pulse">
                      HOY
                    </span>
                  )}
                  {dia.isNew && <span className="text-[10px] text-zinc-500 font-bold italic tracking-tighter">(Usando plantilla)</span>}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${dia.activo ? 'text-emerald-500' : 'text-zinc-600'}`}>
                  {dia.activo ? '🟢 Publicado en la web' : '🔴 No programado (Invisible)'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {dia.activo === false && (
                   <button 
                    onClick={() => copyRoutineToPlanning(idx)}
                    className="px-4 py-2 text-[10px] font-bold text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-all font-mono"
                   >Cargar Rutina</button>
                )}
                
                {/* Switch de Activo */}
                <button 
                  type="button"
                  onClick={() => {
                    const newShed = [...planningSchedule]
                    newShed[idx].activo = !newShed[idx].activo
                    setPlanningSchedule(newShed)
                  }}
                  className={`relative w-20 h-10 rounded-full transition-all duration-300 shadow-inner shrink-0 ${dia.activo ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-md ${dia.activo ? 'left-11' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Gestión de Slots */}
            {dia.activo && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(dia.slots || []).map((slot, slotIdx) => (
                    <div key={slotIdx} className="group relative">
                      <input 
                        type="time" 
                        value={slot} 
                        onChange={(e) => updatePlanningSlot(idx, slotIdx, e.target.value)}
                        className="w-full bg-transparent border-b-2 border-zinc-800 hover:border-emerald-500/50 py-4 px-2 text-base font-black text-center [color-scheme:dark] transition-all focus:border-emerald-500 outline-none"
                      />
                      <button 
                        onClick={() => removePlanningSlot(idx, slotIdx)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addPlanningSlot(idx)}
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl py-4 transition-all text-zinc-600 hover:text-emerald-500"
                  >
                    <span className="text-2xl font-black">+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Agregar</span>
                  </button>
                </div>

                {(dia.slots || []).length === 0 && (
                  <div className="py-12 text-center bg-zinc-950/20 rounded-[2rem] border border-dashed border-zinc-800">
                    <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No hay horarios cargados para este día</p>
                    <button 
                      onClick={() => addPlanningSlot(idx)}
                      className="mt-4 text-emerald-500 font-black uppercase text-[10px] underline tracking-widest"
                    >
                      Hacé clic acá para empezar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end sticky bottom-6 z-50">
        <button 
          onClick={onUpdatePlanning}
          disabled={saving}
          className="w-full md:w-auto px-10 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-sm rounded-xl transition-all shadow-2xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
        >
          {saving ? 'GUARDANDO...' : '🚀 PUBLICAR AGENDA SEMANAL'}
        </button>
      </div>
    </div>
  )
}
