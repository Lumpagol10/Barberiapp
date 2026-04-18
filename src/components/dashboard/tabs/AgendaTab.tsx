'use client'

import { Phone, CheckCircle, Clock, Calendar, MessageCircle, Plus, Scissors } from 'lucide-react'
import { Turno, ConfiguracionBarberia } from '@/types/dashboard'
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
  registeredClientsPhones?: Set<string>
  onRegisterClient?: (nombre: string, telefono: string) => void
  planningSchedule?: HorarioEspecifico[]
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
  registeredClientsPhones = new Set(),
  onRegisterClient,
  planningSchedule = []
}: AgendaTabProps) {
  
  const isToday = viewDate === new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/Argentina/Buenos_Aires', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(new Date())

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires'
  }).format(new Date()).toUpperCase()

  const dayPlanning = planningSchedule.find(p => p.fecha === viewDate)
  const allSlots = dayPlanning?.slots || []

  // Create unified timeline
  const timeline = allSlots.map(slot => ({
    slot,
    turn: turns.find(t => t.hora.startsWith(slot))
  }))

  const hasContent = timeline.length > 0

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(333%); }
        }
      `}</style>
      <DashboardHeader 
        title={`HOY ES ${formattedDate}`}
        config={config}
        onOpenSidebar={onOpenSidebar}
        onShare={onShare}
        showStats={true}
        statsValue={turns.length}
        statsLabel="Pendientes Hoy"
      />

      <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-zinc-900/20">
          <div className="w-full sm:w-auto">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              {isToday ? 'Próximos Turnos' : `Turnos del ${new Date(viewDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`}
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 block sm:hidden">Cambiar Fecha:</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                <input 
                  type="date"
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="w-full sm:w-auto bg-zinc-950/50 border border-zinc-800 hover:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-xs font-black text-white uppercase outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden xs:inline">ACTUALIZADO</span>
            </div>
            {isToday && (
              <button 
                onClick={onAddManualTurn}
                className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center justify-center gap-2 border border-orange-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> AGREGAR TURNO MANUAL
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
              {timeline.map(({ slot, turn }) => (
                turn ? (
                  <div key={turn.id} className="p-6 space-y-4 active:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-lg text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                          {turn.cliente_nombre}
                          {!registeredClientsPhones.has(turn.cliente_telefono) && turn.cliente_telefono !== 'MANUAL' && (
                            <button 
                              onClick={() => onRegisterClient?.(turn.cliente_nombre, turn.cliente_telefono)}
                              className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-black active:scale-90 transition-transform shadow-lg shadow-emerald-900/40"
                              title="Registrar Cliente"
                            >
                              <Plus className="w-3 h-3 stroke-[4]" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-2 mt-1 uppercase">
                          <Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}
                        </div>
                        {turn.es_manual && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-600/10 text-orange-500 rounded-md text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                            <Scissors className="w-2.5 h-2.5" /> MANUAL
                          </div>
                        )}
                      </div>
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
                      <div className="px-3 py-1.5 bg-amber-600/10 text-amber-500 rounded-lg font-mono font-black text-xs border border-amber-600/10 uppercase">
                        {turn.hora.substring(0, 5)}hs
                      </div>
                      <button
                        onClick={() => onFinishTurn(turn.id)}
                        className="px-5 py-2.5 bg-emerald-600 text-black rounded-xl font-black text-[10px] uppercase tracking-tighter"
                      >
                        FINALIZAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={slot} className="px-6 py-4 flex items-center justify-between bg-zinc-950/20">
                    <div className="font-mono text-zinc-700 font-black text-[10px] uppercase">{slot}hs</div>
                    <div className="px-3 py-1 border border-zinc-800/50 rounded-lg text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                      Disponible
                    </div>
                  </div>
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
                timeline.map(({ slot, turn }) => (
                  turn ? (
                    <tr key={turn.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-black text-lg text-zinc-100 uppercase tracking-tight mb-1 flex items-center gap-2">
                              {turn.cliente_nombre}
                              {!registeredClientsPhones.has(turn.cliente_telefono) && turn.cliente_telefono !== 'MANUAL' && (
                                <button 
                                  onClick={() => onRegisterClient?.(turn.cliente_nombre, turn.cliente_telefono)}
                                  className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-all shadow-lg shadow-emerald-900/40"
                                  title="Registrar como Cliente"
                                >
                                  <Plus className="w-3 h-3 stroke-[4]" />
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                              <Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 text-amber-500 rounded-xl font-mono font-black border border-amber-600/10">
                          <Clock className="w-4 h-4" /> {turn.hora.substring(0, 5)}hs
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <button
                          onClick={() => onFinishTurn(turn.id)}
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-2xl transition-all font-black text-xs uppercase tracking-tighter shadow-lg shadow-emerald-900/5 border border-emerald-600/20 active:scale-90"
                        >
                          <CheckCircle className="w-4 h-4" /> 
                          FINALIZAR
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={slot} className="bg-zinc-950/10">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Disponible</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-mono text-zinc-700 font-bold text-xs">{slot}hs</div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="inline-block px-3 py-1 border border-zinc-800/30 rounded-lg text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em]">
                          Libre
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
