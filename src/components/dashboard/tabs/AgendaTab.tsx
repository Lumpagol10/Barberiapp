'use client'

import React, { useMemo } from 'react'
import { 
  Calendar, Clock, CheckCircle, MessageCircle, Phone, Scissors, 
  Trash2, UserPlus, Star, ChevronLeft, ChevronRight, Plus, X 
} from 'lucide-react'
import { Turno, ConfiguracionBarberia, Cliente, HorarioEspecifico } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'

interface AgendaTabProps {
  turns: Turno[]
  viewDate: string
  setViewDate: (date: string) => void
  onFinishTurn: (id: string) => void
  config: ConfiguracionBarberia | null
  onShare: () => void
  onOpenSidebar: () => void
  onAddManualTurn: () => void
  fetchingTurns?: boolean
  clients?: Cliente[]
  vipPhones?: Set<string>
  onRegisterClient?: (nombre: string, telefono: string) => void
  planningSchedule?: HorarioEspecifico[]
  onDeleteTurn?: (id: string) => void
}

export default function AgendaTab({
  turns,
  viewDate,
  setViewDate,
  onFinishTurn,
  config,
  onShare,
  onOpenSidebar,
  onAddManualTurn,
  fetchingTurns = false,
  clients = [],
  vipPhones = new Set(),
  onRegisterClient,
  planningSchedule = [],
  onDeleteTurn
}: AgendaTabProps) {
  
  const todayStr = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/Argentina/Buenos_Aires', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(new Date())

  const isToday = viewDate === todayStr

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(new Date(viewDate + 'T12:00:00')).toUpperCase()
  }, [viewDate])

  const dayPlanning = planningSchedule.find(p => p.fecha === viewDate)
  const allSlots = dayPlanning?.slots || []

  // Lógica de Tiempo Real (Argentina)
  const argNow = new Date()
  const currentArgTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(argNow)
  const [currH, currM] = currentArgTime.split(':').map(Number)
  const currentTotalMinutes = currH * 60 + currM

  // Create unified timeline
  const timeline = allSlots.map(slot => {
    const [slotH, slotM] = slot.split(':').map(Number)
    const slotTotalMinutes = slotH * 60 + slotM
    const isPast = isToday && (slotTotalMinutes < currentTotalMinutes + 15)
    
    return {
      slot,
      isPast,
      turn: turns.find(t => t.hora.startsWith(slot))
    }
  })

  const hasContent = timeline.length > 0

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(333%); }
        }
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .jump-animation {
          display: inline-block;
          animation: jump 2s ease-in-out infinite;
        }
      `}</style>
      <DashboardHeader 
        title={isToday ? `HOY ES ${formattedDate}` : `ESTÁS VIENDO EL ${formattedDate}`}
        config={config}
        onOpenSidebar={onOpenSidebar}
        onShare={onShare}
        showStats={true}
        statsValue={turns.length}
        statsLabel="Pendientes de Hoy"
      />

      <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-zinc-900/20">
          <div className="w-full sm:w-auto">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              {isToday ? 'Próximos Turnos' : `Turnos del ${new Date(viewDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`}
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 block ml-1">Calendario de Agenda</label>
              <div className="flex items-center gap-3">
                <div className="relative group w-full sm:w-auto">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                  <input 
                    type="date"
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    className="w-full sm:w-auto bg-zinc-950/50 border border-zinc-800 hover:border-amber-500/50 rounded-xl h-[46px] pl-12 pr-4 text-xs font-black text-white uppercase outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                
                {!isToday && (
                  <button 
                    onClick={() => setViewDate(todayStr)}
                    className="flex-1 sm:flex-none px-4 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-black text-[9px] font-black uppercase rounded-xl border border-amber-500/20 shadow-lg active:scale-95 transition-all animate-in fade-in zoom-in duration-300 italic tracking-widest h-[46px] flex items-center justify-center whitespace-nowrap"
                  >
                    ↩ Volver a Hoy
                  </button>
                )}
              </div>
            </div>

            {isToday && (
              <button 
                onClick={onAddManualTurn}
                className="w-full sm:w-auto px-6 bg-orange-600 hover:bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center justify-center gap-2 border border-orange-500/20 h-[46px] whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> AGREGAR TURNO MANUAL
              </button>
            )}
          </div>
        </div>

        {/* Loading Indicator for Date Change (Subtle) */}
        {fetchingTurns && (
          <div className="h-1 bg-amber-600/20 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-amber-500 animate-[loading-bar_1.5s_infinite]" style={{ width: '30%' }} />
          </div>
        )}

        {/* Vista Mobile: Cards */}
        <div className={`block md:hidden transition-opacity duration-300 ${fetchingTurns ? 'opacity-50' : 'opacity-100'}`}>
          {hasContent ? (
            <div className="divide-y divide-zinc-800/30">
              {timeline.map(({ slot, turn, isPast }, idx) => (
                turn ? (
                  <div key={turn.id} className={`p-6 space-y-4 active:bg-white/[0.02] transition-colors relative border-l-2 hover:border-l-amber-500 hover:bg-amber-500/5 hover:grayscale-0 hover:opacity-100 ${isPast ? 'border-l-amber-500 bg-amber-500/5 opacity-50 grayscale' : 'border-l-transparent'}`}>
                    <div className="flex justify-between items-start pr-12">
                      <div>
                        <div className="font-black text-lg text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                          {turn.cliente_nombre}
                          
                          {/* INDICADOR VIP 💎 */}
                          {vipPhones.has(turn.cliente_telefono) && (
                            <span className="text-sm jump-animation" title="Cliente VIP">💎</span>
                          )}
                        </div>
                        
                        {/* BADGE DE REGALO 🎁 */}
                        {(() => {
                          const clientData = clients.find(c => c.telefono === turn.cliente_telefono)
                          if (config?.fidelizacion_activa && clientData && (clientData.total_cortes + 1) % (config.fidelizacion_threshold || 10) === 0) {
                            return (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded-md shadow-lg shadow-amber-900/20 animate-bounce">
                                🎁 ¡CORTE GRATIS!
                              </div>
                            )
                          }
                          return null
                        })()}
                        <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-2 mt-1 uppercase">
                          <Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}
                          
                          {/* QUICK REGISTER CRM (AMBER USERPLUS) */}
                          {!clients.some(c => c.telefono === turn.cliente_telefono) && turn.cliente_telefono !== 'MANUAL' && (
                            <button 
                              onClick={() => onRegisterClient?.(turn.cliente_nombre, turn.cliente_telefono)}
                              className="ml-1 p-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20 active:scale-90 transition-all shadow-lg"
                              title="Registrar Cliente Nuevo"
                            >
                              <UserPlus className="w-3 h-3 stroke-[3]" />
                            </button>
                          )}
                        </div>
                        {turn.es_manual && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-600/10 text-orange-500 rounded-md text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                            <Scissors className="w-2.5 h-2.5" /> MANUAL
                          </div>
                        )}
                      </div>
                      
                      {/* BOTÓN ELIMINAR MINIMALISTA MOBILE (ESQUINA SUPERIOR DERECHA) - X SUTIL */}
                      <button
                        type="button"
                        aria-label="Eliminar turno"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTurn?.(turn.id);
                        }}
                        className="absolute top-1 right-1 p-3 text-red-500/50 hover:text-red-500 active:scale-95 z-10"
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/10">
                          <X className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>

                      <a 
                        href={`https://wa.me/${turn.cliente_telefono.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-emerald-600 text-black rounded-full shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-amber-600/10 text-amber-500 rounded-lg font-mono font-black text-xs border border-amber-600/10 uppercase">
                          {turn.hora.substring(0, 5)}hs
                        </div>
                        {isPast && (
                          <div className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-black text-[9px] uppercase tracking-widest border border-amber-500/20">
                            Pendiente
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onFinishTurn(turn.id)}
                        className="px-8 py-3 bg-emerald-600 text-black rounded-xl font-black text-[11px] uppercase tracking-tighter shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform"
                      >
                        FINALIZAR TURNO
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    key={`${slot}-${idx}`} 
                    aria-label="Agendar turno"
                    onClick={onAddManualTurn}
                    className={`w-full p-6 flex items-center justify-between group border-b border-zinc-800/10 last:border-0 transition-all duration-200 hover:bg-amber-500/5 hover:border-amber-500/20 hover:grayscale-0 hover:opacity-100 ${isPast ? 'bg-zinc-950/20 opacity-40 grayscale' : 'bg-zinc-950/10'}`}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="font-mono text-zinc-600 font-black text-xs uppercase tracking-tighter">{slot}hs</div>
                      <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] group-hover:text-amber-500/50 transition-colors">
                        Disponible
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Agendar</span>
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all shadow-xl">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                )
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-8">
              <div className="text-zinc-700 text-3xl font-black uppercase opacity-20 mb-2 italic">Sin Agenda</div>
              <p className="text-zinc-600 text-xs font-medium italic uppercase tracking-widest">No hay horarios programados</p>
            </div>
          )}
        </div>

        {/* Vista Desktop: Tabla */}
        <div className={`hidden md:block overflow-x-auto transition-opacity duration-300 ${fetchingTurns ? 'opacity-50' : 'opacity-100'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/30 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Hora</th>
                <th className="px-8 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {hasContent ? (
                timeline.map(({ slot, turn, isPast }, idx) => (
                  turn ? (
                    <tr key={turn.id} className={`transition-colors group border-l-2 hover:border-l-amber-500 hover:bg-amber-500/5 hover:grayscale-0 hover:opacity-100 ${isPast ? 'border-l-amber-500 bg-amber-500/5 opacity-50 grayscale' : 'border-l-transparent hover:bg-white/[0.02]'}`}>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-black text-lg text-zinc-100 uppercase tracking-tight mb-1 flex items-center gap-2">
                              {turn.cliente_nombre}
                              
                              {/* INDICADOR VIP 💎 */}
                              {vipPhones.has(turn.cliente_telefono) && (
                                <span className="text-xl jump-animation" title="Cliente VIP">💎</span>
                              )}

                              {vipPhones.has(turn.cliente_telefono) && (
                                <span className="text-xl jump-animation" title="Cliente VIP">💎</span>
                              )}
                            </div>

                            {/* BADGE DE REGALO 🎁 */}
                            {(() => {
                              const clientData = clients.find(c => c.telefono === turn.cliente_telefono)
                              if (config?.fidelizacion_activa && clientData && (clientData.total_cortes + 1) % (config.fidelizacion_threshold || 10) === 0) {
                                return (
                                  <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg shadow-lg shadow-amber-900/20 animate-pulse">
                                    🎁 ESTE CORTE ES GRATIS
                                  </div>
                                )
                              }
                              return null
                            })()}
                            <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                              <Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}

                              {/* QUICK REGISTER CRM (AMBER USERPLUS) */}
                              {!clients.some(c => c.telefono === turn.cliente_telefono) && turn.cliente_telefono !== 'MANUAL' && (
                                <button 
                                  onClick={() => onRegisterClient?.(turn.cliente_nombre, turn.cliente_telefono)}
                                  className="p-1 px-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-md border border-amber-500/20 transition-all transform hover:scale-105 active:scale-90 shadow-xl"
                                  title="Registrar Cliente Nuevo"
                                >
                                  <UserPlus className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              )}
                            </div>
                            {turn.es_manual && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-orange-600/10 text-orange-500 rounded-md text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                                <Scissors className="w-2.5 h-2.5" /> MARCACIÓN MANUAL
                              </div>
                            )}
                          </div>
                          <a 
                            href={`https://wa.me/${turn.cliente_telefono.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-full transition-all active:scale-90"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col items-start gap-2">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 text-amber-500 rounded-xl font-mono font-black border border-amber-600/10">
                            <Clock className="w-4 h-4" /> {turn.hora.substring(0, 5)}hs
                          </div>
                          {isPast && (
                            <div className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-black text-[10px] uppercase tracking-widest border border-amber-500/20">
                              Pendiente
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTurn?.(turn.id);
                            }}
                            className="p-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all shadow-lg shadow-red-900/5 active:scale-90"
                            title="Eliminar Turno"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onFinishTurn(turn.id)}
                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-2xl transition-all font-black text-xs uppercase tracking-tighter shadow-lg shadow-emerald-900/5 border border-emerald-600/20 active:scale-90"
                          >
                            <CheckCircle className="w-4 h-4" /> 
                            FINALIZAR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr 
                      key={`${slot}-${idx}`} 
                      onClick={onAddManualTurn}
                      className={`transition-all duration-200 group cursor-pointer hover:bg-amber-500/5 hover:grayscale-0 hover:opacity-100 ${isPast ? 'bg-zinc-950/20 opacity-40 grayscale' : 'bg-zinc-950/5'}`}
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-8 bg-zinc-900 border border-white/5 rounded-full group-hover:bg-amber-500 shadow-inner transition-all" />
                          <div>
                            <div className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-amber-500 transition-colors">
                              Disponible
                            </div>
                            <div className="text-zinc-800 text-[8px] font-bold uppercase tracking-tighter mt-1">Slot Libre para Reserva</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 text-zinc-600 rounded-lg font-mono font-black border border-white/5 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all text-xs">
                          {slot}hs
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="inline-flex items-center gap-3 px-6 py-3.5 bg-zinc-900 border border-white/5 text-zinc-600 group-hover:text-black group-hover:bg-amber-500 group-hover:border-amber-500 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.1em] shadow-lg">
                          <Plus className="w-4 h-4" /> 
                          AGENDAR TURNO
                        </div>
                      </td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter italic">Sin Agenda</div>
                    <p className="text-zinc-600 font-medium italic uppercase tracking-widest text-xs">No hay horarios programados para hoy</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
