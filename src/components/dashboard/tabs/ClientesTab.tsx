'use client'

import { Users, Phone, Calendar, TrendingUp, Search } from 'lucide-react'
import { Cliente, ConfiguracionBarberia } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'
import { useState } from 'react'

interface ClientesTabProps {
  clientes: Cliente[]
  config: ConfiguracionBarberia | null
  onOpenSidebar: () => void
}

export default function ClientesTab({
  clientes,
  config,
  onOpenSidebar
}: ClientesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefono.includes(searchTerm)
  )

  const totalClients = clientes.length
  const topClient = [...clientes].sort((a, b) => b.total_cortes - a.total_cortes)[0]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <DashboardHeader 
        title="Gestión de Clientes"
        subtitle={<p className="text-zinc-500 text-sm sm:text-base font-medium italic hidden md:block">Base de datos de tus clientes más fieles</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<Users className="w-6 h-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-zinc-900/50 border border-amber-500/20 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl flex items-center gap-6">
          <div className="p-4 bg-amber-600/10 rounded-2xl text-amber-500">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Clientes</p>
            <span className="text-3xl font-black text-white tracking-tighter">{totalClients}</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-emerald-500/20 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl flex items-center gap-6 overflow-hidden">
          <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cliente Estrella</p>
            <span className="text-xl font-black text-white tracking-tighter truncate block uppercase italic">
              {topClient ? topClient.nombre : 'Sin datos'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center bg-zinc-900/20 gap-4">
          <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Directorio de Clientes</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="BUSCAR CLIENTE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black text-white uppercase outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Vista Mobile: Cards */}
        <div className="block md:hidden">
          {filteredClientes.length > 0 ? (
            <div className="divide-y divide-zinc-800/30">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="p-6 space-y-3 active:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-zinc-100 uppercase tracking-tight">{cliente.nombre}</div>
                      <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3 text-zinc-700" /> {cliente.telefono}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-600/10 text-emerald-500 rounded-lg font-black text-[10px]">
                      {cliente.total_cortes} CORTES
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-zinc-800" /> 
                    Último: {cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString('es-AR') : '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-8 text-zinc-800">
              <div className="text-zinc-700 text-3xl font-black uppercase opacity-20 mb-2 italic">Sin Resultados</div>
              <p className="text-zinc-600 text-xs font-medium italic uppercase tracking-widest">No se encontraron clientes</p>
            </div>
          )}
        </div>

        {/* Vista Desktop: Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/30 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Contacto</th>
                <th className="px-8 py-6 text-center">Frecuencia</th>
                <th className="px-8 py-6 text-right">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center text-amber-500 font-black text-xs">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-zinc-100 uppercase tracking-tight">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-700" /> {cliente.telefono}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-white text-lg px-4 py-2 bg-zinc-800/50 rounded-xl group-hover:bg-emerald-600/10 group-hover:text-emerald-500 transition-all">
                        {cliente.total_cortes} CORTES
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-xs text-zinc-500 font-bold">
                        {cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString('es-AR') : '—'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter italic">Sin Registros</div>
                    <p className="text-zinc-600 font-medium italic">No hay clientes con esos criterios.</p>
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
