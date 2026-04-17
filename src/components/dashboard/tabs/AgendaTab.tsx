'use client'

import { Phone, CheckCircle, Clock, Calendar, MessageCircle } from 'lucide-react'
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
}

export default function AgendaTab({
  turns,
  viewDate,
  setViewDate,
  onFinishTurn,
  config,
  onShare,
  onOpenSidebar
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
          </div>
        </div>

        {/* Vista Mobile: Cards */}
        <div className="block md:hidden">
          {turns.length > 0 ? (
            <div className="divide-y divide-zinc-800/30">
              {turns.map((turn) => (
                <div key={turn.id} className="p-6 space-y-4 active:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-lg text-zinc-100 uppercase tracking-tight">{turn.cliente_nombre}</div>
                      <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-2 mt-1 uppercase">
                        <Phone className="w-3 h-3" /> {turn.cliente_telefono}
                      </div>
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
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-8">
              <div className="text-zinc-700 text-3xl font-black uppercase opacity-20 mb-2 italic">Sin Turnos</div>
              <p className="text-zinc-600 text-xs font-medium italic uppercase tracking-widest">Día despejado</p>
            </div>
          )}
        </div>

        {/* Vista Desktop: Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/30 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Hora</th>
                <th className="px-8 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {turns.length > 0 ? (
                turns.map((turn) => (
                  <tr key={turn.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-black text-lg text-zinc-100 uppercase tracking-tight mb-1">{turn.cliente_nombre}</div>
                          <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                            <Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}
                          </div>
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
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter italic">No hay turnos</div>
                    <p className="text-zinc-600 font-medium italic">Todo despejado para esta fecha.</p>
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
