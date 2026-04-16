'use client'

import { useState } from 'react'
import { CheckCircle, LogOut, Scissors, Users, Calendar, TrendingUp } from 'lucide-react'

// Datos de ejemplo para la tabla
const INITIAL_TURNS = [
  { id: 1, name: 'Carlos Mendoza', phone: '11 5566-7788', time: '14:30', status: 'pending' },
  { id: 2, name: 'Facundo García', phone: '11 2233-4455', time: '15:15', status: 'pending' },
  { id: 3, name: 'Julián Álvarez', phone: '11 9900-1122', time: '16:00', status: 'pending' },
]

export default function Dashboard() {
  const [turns, setTurns] = useState(INITIAL_TURNS)

  const handleFinish = (id: number) => {
    setTurns(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex pb-12">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 flex-col bg-zinc-900/50 border-r border-zinc-800/50 p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-amber-600 rounded-lg">
            <Scissors className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter">BARBERIAPP</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-600/10 text-amber-500 rounded-xl font-medium">
            <Calendar className="w-5 h-5" /> Turnos Hoy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-all">
            <Users className="w-5 h-5" /> Historial
          </button>
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors mt-auto">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        {/* Header Stats */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Panel de Control</h1>
            <p className="text-zinc-500">Gestión de turnos diaria para tu sucursal</p>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl sm:w-32">
              <p className="text-zinc-500 text-xs font-medium uppercase mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-amber-500">{turns.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl sm:w-32">
              <p className="text-zinc-500 text-xs font-medium uppercase mb-1">Cortes hoy</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                12 <TrendingUp className="w-4 h-4 text-emerald-500" />
              </p>
            </div>
          </div>
        </header>

        {/* Turnos Table */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Próximos Turnos</h3>
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">Actualizado hace un momento</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800/30 text-zinc-500 text-sm">
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Teléfono</th>
                  <th className="px-6 py-4 font-medium">Hora</th>
                  <th className="px-6 py-4 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {turns.length > 0 ? (
                  turns.map((turn) => (
                    <tr key={turn.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-zinc-200">{turn.name}</div>
                        <div className="lg:hidden text-xs text-zinc-500 mt-1">{turn.phone}</div>
                      </td>
                      <td className="px-6 py-5 text-zinc-400 text-sm hidden lg:table-cell">{turn.phone}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-amber-600/10 text-amber-500 rounded-lg font-mono font-bold border border-amber-600/20">
                          {turn.time}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleFinish(turn.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all font-bold text-xs"
                        >
                          <CheckCircle className="w-4 h-4" /> 
                          <span className="hidden sm:inline">FINALIZAR CORTE</span>
                          <span className="sm:hidden">FINALIZAR</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic">
                      No hay más turnos pendientes por hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
