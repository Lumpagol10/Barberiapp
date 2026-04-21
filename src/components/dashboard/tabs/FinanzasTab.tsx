'use client'

import { DollarSign, TrendingUp, Scissors, Wallet, Building2, Package, ShoppingBag, Plus } from 'lucide-react'
import { FinanzasData, ConfiguracionBarberia, Producto } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'
import VentaProductoModal from '../modals/VentaProductoModal'
import { useState } from 'react'

interface FinanzasTabProps {
  financesData: FinanzasData
  financesDate: string
  setFinancesDate: (date: string) => void
  financesMonth: string
  setFinancesMonth: (month: string) => void
  historyFilterMode: 'day' | 'month'
  setHistoryFilterMode: (mode: 'day' | 'month') => void
  config: ConfiguracionBarberia | null
  onOpenSidebar: () => void
  products?: Producto[]
  onRecordSale?: (nombre: string, precio: number, metodo: 'efectivo' | 'transferencia') => void
  saving?: boolean
}

export default function FinanzasTab({
  financesData,
  financesDate,
  setFinancesDate,
  financesMonth,
  setFinancesMonth,
  historyFilterMode,
  setHistoryFilterMode,
  config,
  onOpenSidebar,
  products = [],
  onRecordSale,
  saving = false
}: FinanzasTabProps) {
  const [showVentaModal, setShowVentaModal] = useState(false)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <DashboardHeader 
        title="Finanzas y Caja"
        subtitle={<p className="text-zinc-500 text-sm sm:text-base font-medium italic hidden md:block">Control de ingresos y balance de servicios</p>}
        config={config}
        onOpenSidebar={onOpenSidebar}
        icon={<DollarSign className="w-6 h-6" />}
      />

      <div className="flex justify-end mb-8">
        <button 
          onClick={() => setShowVentaModal(true)}
          className="flex items-center gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Venta de Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 lg:mb-12">
        {/* Total Diario */}
        <div className="bg-zinc-900/50 border border-emerald-500/20 p-5 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-emerald-950/10 backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
          <div className="flex flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <label className={`text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 block transition-colors ${historyFilterMode === 'day' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                Monto Diario {historyFilterMode === 'day' && '• ACTIVO'}
              </label>
              <input 
                type="date" 
                value={financesDate}
                onChange={(e) => {
                  setFinancesDate(e.target.value)
                  setHistoryFilterMode('day')
                }}
                className="bg-zinc-950/80 sm:bg-transparent border border-zinc-800 sm:border-none rounded-lg px-3 py-2.5 sm:p-0 w-full sm:w-auto text-zinc-300 sm:text-zinc-500 text-xs font-bold outline-none [color-scheme:dark] cursor-pointer"
              />
            </div>
            <div 
              onClick={() => setHistoryFilterMode('day')}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${historyFilterMode === 'day' ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-900/40' : 'bg-emerald-600/10 text-emerald-500 group-hover:scale-110'}`}
            >
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">${financesData.dailyTotal.toLocaleString('es-AR')}</span>
            <span className="text-zinc-500 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest italic">ARS</span>
          </div>
          {historyFilterMode === 'day' && (
            <div className="mt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-500/70">
              <span>EFEC: ${(financesData.dailyCashTotal || 0).toLocaleString('es-AR')}</span>
              <span className="text-zinc-700">|</span>
              <span>TRANSF: ${(financesData.dailyTransferTotal || 0).toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

        {/* Total Mensual */}
        <div className="bg-zinc-900/50 border border-amber-500/20 p-5 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-amber-950/10 backdrop-blur-xl group hover:border-amber-500/40 transition-all">
          <div className="flex flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <label className={`text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 block transition-colors ${historyFilterMode === 'month' ? 'text-amber-500' : 'text-zinc-600'}`}>
                Cierre Mensual {historyFilterMode === 'month' && '• ACTIVO'}
              </label>
              <input 
                type="month" 
                value={financesMonth}
                onChange={(e) => {
                  setFinancesMonth(e.target.value)
                  setHistoryFilterMode('month')
                }}
                className="bg-zinc-950/80 sm:bg-transparent border border-zinc-800 sm:border-none rounded-lg px-3 py-2.5 sm:p-0 w-full sm:w-auto text-zinc-300 sm:text-zinc-500 text-xs font-bold outline-none [color-scheme:dark] cursor-pointer"
              />
            </div>
            <div 
              onClick={() => setHistoryFilterMode('month')}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${historyFilterMode === 'month' ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/40' : 'bg-amber-600/10 text-amber-500 group-hover:scale-110'}`}
            >
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">${financesData.monthlyTotal.toLocaleString('es-AR')}</span>
            <span className="text-zinc-500 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest italic">ARS</span>
          </div>
        </div>

        {/* Total Anual */}
        <div className="bg-zinc-900/50 border border-blue-500/20 p-5 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-blue-950/10 backdrop-blur-xl group hover:border-blue-500/40 transition-all">
          <div className="flex flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <p className="text-blue-500 text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5">Balance Anual</p>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest block py-1 sm:py-0">Año {new Date().getFullYear()}</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-blue-600/10 rounded-xl sm:rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 rotate-90" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">${financesData.annualTotal.toLocaleString('es-AR')}</span>
            <span className="text-zinc-500 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest italic">ARS</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
          <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Cronograma de Ingresos</h3>
          <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Vista Mobile: Cards */}
        <div className="block md:hidden">
          {financesData.history.length > 0 ? (
            <div className="divide-y divide-zinc-800/30">
              {financesData.history.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-center active:bg-white/[0.02] transition-colors">
                  <div>
                    {item.isSale ? (
                        <div className="text-[10px] text-emerald-500 font-bold mt-1 uppercase flex items-center gap-1.5">
                            <Package className="w-3 h-3" /> PRODUCTO
                        </div>
                    ) : item.descripcion_servicio && (
                      <div className="text-[10px] text-amber-500 font-bold mt-1 uppercase flex items-center gap-1.5">
                        <Scissors className="w-3 h-3" /> {item.descripcion_servicio}
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase italic">
                      {item.fecha && new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} • {item.hora?.substring(0, 5)}hs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg ${item.isSale ? 'text-emerald-400' : 'text-emerald-500'}`}>
                      +${(Number(item.precio || (item as any).precio) || 0).toLocaleString('es-AR')}
                    </div>
                    {item.metodo_pago && (
                      <div className="text-[8px] text-zinc-500 font-black mt-1 uppercase tracking-widest flex items-center justify-end gap-1">
                        {item.metodo_pago === 'efectivo' ? <Wallet className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                        {item.metodo_pago}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center px-8 text-zinc-800">
              <div className="text-zinc-700 text-3xl font-black uppercase opacity-20 mb-2 italic">Sin Ingresos</div>
              <p className="text-zinc-600 text-xs font-medium italic uppercase tracking-widest">Esperando el primer cobro</p>
            </div>
          )}
        </div>

        {/* Vista Desktop: Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/30 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Fecha y Hora</th>
                <th className="px-8 py-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {financesData.history.length > 0 ? (
                financesData.history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-black text-zinc-100 uppercase tracking-tight block">{item.isSale ? (item as any).nombre_producto : item.cliente_nombre}</span>
                      {item.isSale ? (
                         <div className="text-[10px] text-emerald-500 font-bold mt-1.5 uppercase flex items-center gap-1.5">
                            <ShoppingBag className="w-3 h-3" /> PRODUCTO EXCLUSIVO
                         </div>
                      ) : item.descripcion_servicio && (
                        <div className="text-[10px] text-amber-500 font-bold mt-1.5 uppercase flex items-center gap-1.5">
                          <Scissors className="w-3 h-3" /> {item.descripcion_servicio}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs text-zinc-500 font-bold">
                        {item.fecha && new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} - {item.hora?.substring(0, 5)}hs
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`font-black text-lg group-hover:scale-110 transition-transform inline-block ${item.isSale ? 'text-emerald-400' : 'text-emerald-500'}`}>
                        +${(Number(item.precio || (item as any).precio) || 0).toLocaleString('es-AR')}
                      </span>
                      {item.metodo_pago && (
                        <div className="text-[9px] text-zinc-500 font-black mt-1.5 uppercase tracking-widest flex items-center justify-end gap-1">
                          {item.metodo_pago === 'efectivo' ? <Wallet className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                          {item.metodo_pago}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="text-zinc-700 text-4xl font-black uppercase opacity-20 mb-4 tracking-tighter italic">Sin Cobros</div>
                    <p className="text-zinc-600 font-medium italic">Todavía no has registrado ingresos.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <VentaProductoModal 
        isOpen={showVentaModal}
        onClose={() => setShowVentaModal(false)}
        onConfirm={(name, price, method) => onRecordSale?.(name, price, method)}
        products={products}
        saving={saving}
      />
    </div>
  )
}
