'use client'

import React, { useState } from 'react'
import { Calendar, Settings, Scissors } from 'lucide-react'
import { HorarioRutina, HorarioEspecifico, ConfiguracionBarberia } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'

interface ProgramarTabProps {
  masterRoutine: HorarioRutina[]
  setMasterRoutine: (routine: HorarioRutina[]) => void
  planningSchedule: HorarioEspecifico[]
  setPlanningSchedule: (planning: HorarioEspecifico[]) => void
  onUpdateMasterRoutine: () => void
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
  masterRoutine,
  setMasterRoutine,
  planningSchedule,
  setPlanningSchedule,
  onUpdateMasterRoutine,
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
      <DashboardHeader 
        title="Agenda Semanal"
        subtitle={<p className="text-zinc-500 font-medium italic hidden md:block">Confirmá los días que vas a trabajar esta semana</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<Scissors className="w-6 h-6 rotate-90" />}
      />

      <div className="flex justify-end mb-8 -mt-8">
        <button 
          onClick={() => setShowMasterRoutine(!showMasterRoutine)}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all italic flex items-center gap-2"
        >
          <Settings className="w-4 h-4" /> Configurar Rutina Maestra
        </button>
      </div>

      {/* MODAL / SECCIÓN RUTINA MAESTRA */}
      {showMasterRoutine && (
        <div className="bg-zinc-900/80 border border-amber-600/20 rounded-[2.5rem] p-8 lg:p-12 mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">⚙️ Rutina Maestra (Plantilla base)</h3>
            <button onClick={() => setShowMasterRoutine(false)} className="text-zinc-500">Cerrar</button>
          </div>
          <p className="text-zinc-500 text-sm mb-10 italic">Los horarios que definas acá servirán de base para las nuevas semanas, pero tenés que confirmarlos en la &apos;Agenda Semanal&apos; para que el cliente los vea.</p>
          
          <div className="space-y-4">
            {masterRoutine.map((r, idx) => (
              <div key={r.dia_semana} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950/30 rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-4 min-w-[150px]">
                  <span className="font-black italic uppercase text-zinc-400">{diasLetras[r.dia_semana]}</span>
                  <button 
                    onClick={() => {
                       const newR = [...masterRoutine]
                       newR[idx].activo = !newR[idx].activo
                       setMasterRoutine(newR)
                    }}
                    className={`w-10 h-6 rounded-full relative transition-all ${r.activo ? 'bg-amber-600' : 'bg-zinc-800'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${r.activo ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                   {r.slots.map((s, sIdx) => (
                     <input 
                      key={sIdx}
                      type="time" 
                      value={s}
                      onChange={(e) => {
                         const newR = [...masterRoutine]
                         newR[idx].slots[sIdx] = e.target.value
                         setMasterRoutine(newR)
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-white [color-scheme:dark]"
                     />
                   ))}
                   <button 
                    onClick={() => {
                       const newR = [...masterRoutine]
                       newR[idx].slots.push("09:00")
                       setMasterRoutine(newR)
                    }}
                    className="px-2 py-1 text-amber-500 font-bold"
                   >+</button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onUpdateMasterRoutine}
            disabled={saving}
            className="mt-8 w-full py-4 bg-amber-600 text-black font-black uppercase rounded-xl transition-all active:scale-95"
          >Guardar Rutina Maestra</button>
        </div>
      )}

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
          <div key={dia.fecha} className={`bg-zinc-900/40 border transition-all rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-8 ${dia.activo ? 'border-emerald-500/20 shadow-lg mb-4' : 'border-white/5 opacity-60'}`}>
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
                        className="w-full bg-zinc-950/50 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl py-4 px-4 text-xl font-black text-center [color-scheme:dark] transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
          className="w-full md:w-auto px-16 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-tighter"
        >
          {saving ? 'GUARDANDO...' : '🚀 PUBLICAR AGENDA SEMANAL'}
        </button>
      </div>
    </div>
  )
}
