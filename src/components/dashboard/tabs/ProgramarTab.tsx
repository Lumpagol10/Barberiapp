'use client'

import React, { useState } from 'react'
import { Calendar, Settings, Scissors } from 'lucide-react'
import { toast } from 'sonner'
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
  upcomingTurns?: any[]
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
  onOpenSidebar,
  upcomingTurns = []
}: ProgramarTabProps) {
  const [showMasterRoutine, setShowMasterRoutine] = useState(false)
  const diasLetras = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl pb-24 lg:pb-0 min-h-screen">
      <style jsx>{`
        /* Apple-style Cleanup: Ocultar indicadores nativos de calendarios/relojes */
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-inner-spin-button,
        input[type="time"]::-webkit-clear-button {
          display: none !important;
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      <DashboardHeader 
        title="Agenda Semanal"
        subtitle={<p className="text-zinc-500 font-medium italic hidden md:block">Confirmá los días que vas a trabajar esta semana</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<Scissors className="w-6 h-6 rotate-90" />}
      />

      {/* SECCIÓN RUTINA MAESTRA ELIMINADA POR USUARIO */}
      {planningSchedule.length > 0 && (
        <div className="mb-10 p-6 bg-amber-600/10 border border-amber-600/20 rounded-[2rem] flex items-center gap-4">
          <div className="p-3 bg-amber-600 rounded-xl text-black">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-amber-500 text-sm font-black uppercase tracking-tighter leading-tight italic">
            Solo los días que marques como &quot;ACTIVOS&quot; y guardes serán visibles para tus clientes en la web de reserva.
          </p>
        </div>
      )}

      <div className="grid gap-6 mb-12">
        {planningSchedule.length === 0 ? (
          // SKELETONS PARA MANTENER EL SCROLL ESTABLE
          [...Array(7)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 h-48 animate-pulse flex flex-col justify-between">
              <div className="w-48 h-10 bg-zinc-800 rounded-xl" />
              <div className="flex gap-4">
                <div className="w-24 h-8 bg-zinc-800 rounded-lg" />
                <div className="w-16 h-8 bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))
        ) : (
          planningSchedule.map((dia, idx) => (
            <div key={dia.fecha} className={`bg-zinc-900/40 border rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-8 ${dia.activo ? 'border-emerald-500/20' : 'border-white/5 opacity-60'}`}>
              {/* Header del Día */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic">
                      {diasLetras[new Date(dia.fecha + 'T12:00:00').getDay()]} {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                    </h3>
                    {dia.fecha === new Date().toLocaleDateString('en-CA') && (
                      <span className="px-3 py-1 bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                        HOY
                      </span>
                    )}
                    {dia.isNew && <span className="text-[10px] text-zinc-500 font-bold italic tracking-tighter">(Nuevo)</span>}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${dia.activo ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {dia.activo ? '🟢 Publicado en la web' : '🔴 No programado (Invisible)'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {dia.activo === false && (
                    <button 
                      type="button"
                      onClick={() => copyRoutineToPlanning(idx)}
                      className="px-4 py-2 text-[10px] font-bold text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-all font-mono"
                    >Cargar Rutina</button>
                  )}
                  
                  {/* Switch de Activo */}
                  <button 
                    type="button"
                    onClick={() => {
                      // HOTFIX: Validar si hay turnos antes de cerrar el día
                      const hasTurns = upcomingTurns?.some(t => t.fecha === dia.fecha)
                      if (hasTurns && dia.activo) {
                        toast.error("No podés cerrar este día porque ya tenés clientes agendados. Cancelá los turnos primero.", {
                          style: { background: '#18181b', color: '#ef4444', border: '1px solid #ef444420' }
                        })
                        return
                      }

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
                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {(dia.slots || []).map((slot, slotIdx) => {
                      const isOccupied = upcomingTurns.some(t => t.fecha === dia.fecha && t.hora.startsWith(slot))
                      
                      return (
                        <div key={slotIdx} className="group relative">
                          <input 
                            type="time" 
                            value={slot} 
                            disabled={isOccupied}
                            onChange={(e) => updatePlanningSlot(idx, slotIdx, e.target.value)}
                            className={`w-full bg-zinc-950/50 border rounded-2xl py-4 px-2 text-sm font-black text-center [color-scheme:dark] transition-all focus:ring-2 outline-none
                              ${isOccupied 
                                ? 'line-through opacity-40 border-red-500/20 text-red-500/50 cursor-not-allowed' 
                                : 'border-zinc-800 hover:border-emerald-500/30 focus:ring-emerald-500/20 focus:border-emerald-500 text-white'
                              }`}
                          />
                          <button 
                            type="button"
                            aria-label="Eliminar slot"
                            onClick={() => {
                              if (isOccupied) {
                                toast.error("No podés borrar este horario porque ya tenés un cliente agendado. Cancelá el turno primero.", {
                                  style: { background: '#18181b', color: '#ef4444', border: '1px solid #ef444420' }
                                })
                                return
                              }
                              removePlanningSlot(idx, slotIdx)
                            }}
                            className="absolute -top-1 -right-1 p-3 text-red-500/50 hover:text-red-500 active:scale-95 z-10 outline-none"
                          >
                            <div className="w-4 h-4 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/10">
                              <span className="text-[10px] font-black flex items-center justify-center -mt-[1px]">✕</span>
                            </div>
                          </button>
                          {isOccupied && (
                            <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase rounded-full shadow-lg">
                              Ocupado
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    <button 
                      type="button"
                      onClick={() => addPlanningSlot(idx)}
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl py-4 transition-all text-zinc-600 hover:text-emerald-500"
                    >
                      <span className="text-2xl font-black">+</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Agregar Slot</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {planningSchedule.length > 0 && (
        <div className="flex justify-end sticky bottom-6 z-50">
          <button 
            onClick={onUpdatePlanning}
            disabled={saving}
            className="w-full md:w-auto px-10 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-sm rounded-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            {saving ? 'GUARDANDO...' : '🚀 PUBLICAR AGENDA SEMANAL'}
          </button>
        </div>
      )}
    </div>
  )
}
