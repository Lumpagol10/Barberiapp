'use client'

import { useState, useEffect } from 'react'
import { Scissors, Clock, Phone, User, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [showSlots, setShowSlots] = useState(false)
  
  // Form States
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  
  // Availability States
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [config, setConfig] = useState({ apertura: '09:00', cierre: '20:00', intervalo: 15 })

  // Carga inicial: Solo Configuración (Background)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase.from('configuracion_barberia').select('*').single()
        if (data) {
          setConfig({
            apertura: data.hora_apertura,
            cierre: data.hora_cierre,
            intervalo: data.intervalo_minutos
          })
        }
      } catch (error) {
        console.error('Error cargando config inicial:', error)
      }
    }
    fetchConfig()
  }, [])

  const handleDateChange = (nuevaFecha: string) => {
    setFecha(nuevaFecha)
    setShowSlots(true)
    
    // GENERACIÓN INSTANTÁNEA: Usamos los valores actuales (o defaults)
    // No esperamos a la base de datos para mostrar los botones.
    generateSlots(config.apertura, config.cierre, config.intervalo)
    
    // Sincronización en Background: Solo buscamos los ocupados
    fetchBookedTurns(nuevaFecha)
  }

  const fetchBookedTurns = async (date: string) => {
    // Nota: Ya no activamos fetchingSlots para el panel entero
    try {
      const { data } = await supabase
        .from('turnos')
        .select('hora')
        .eq('fecha', date)
      
      const booked = data?.map(t => t.hora.substring(0, 5)) || []
      setBookedSlots(booked)
    } catch (error) {
      console.error('Error sincronizando disponibilidad:', error)
    }
  }

  const generateSlots = (apertura: string, cierre: string, intervalo: number) => {
    const slots = []
    let current = new Date(`2024-01-01T${apertura}`)
    const end = new Date(`2024-01-01T${cierre}`)

    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5)
      slots.push(timeString)
      current.setMinutes(current.getMinutes() + intervalo)
    }
    setAvailableSlots(slots)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!horaSeleccionada) {
      alert('Por favor selecciona un horario')
      return
    }

    setLoading(true)
    
    const { error } = await supabase
      .from('turnos')
      .insert([
        { 
          cliente_nombre: nombre, 
          cliente_telefono: telefono, 
          fecha: fecha, 
          hora: horaSeleccionada 
        }
      ])

    if (error) {
      console.error('Error saving appointment:', error)
      const errorMsg = error.message || 'Error desconocido'
      const errorCode = error.code || 'N/A'
      alert(`Error al guardar el turno:\n${errorMsg} (Código: ${errorCode})\n\nPor favor, verifica las políticas RLS en Supabase.`)
      setLoading(false)
    } else {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-amber-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white">¡Turno Reservado!</h2>
          <p className="text-zinc-400 text-lg">
            Gracias <span className="text-white font-medium">{nombre}</span>. Tu turno para el <span className="text-amber-500 font-semibold">{fecha}</span> a las <span className="text-amber-500 font-semibold">{horaSeleccionada}hs</span> ha sido confirmado.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setNombre('')
              setTelefono('')
              setFecha('')
              setHoraSeleccionada('')
              setShowSlots(false)
            }}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20"
          >
            Nueva Reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />

      <header className="mb-10 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-900/30">
            <Scissors className="w-8 h-8 text-black" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl mb-2">
          BARBERI<span className="text-amber-500 text-6xl">APP</span>
        </h1>
        <p className="text-zinc-400 text-lg font-light tracking-wide italic">LUXURY GROOMING SERVICES</p>
      </header>

      <main className="w-full max-w-2xl relative z-10">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-2xl font-semibold mb-8 text-center text-zinc-200">Reserva tu Turno</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    type="tel"
                    placeholder="+54 11 1234 5678"
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Selecciona una Fecha</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type="date"
                  value={fecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white appearance-none cursor-pointer"
                />
              </div>
            </div>

            {showSlots && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-sm font-medium text-zinc-400 ml-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Horarios Disponibles
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isSelected = horaSeleccionada === slot
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setHoraSeleccionada(slot)}
                        className={`
                          py-3 rounded-xl text-center text-sm font-bold transition-all border
                          ${isBooked ? 'bg-zinc-800/20 border-zinc-800/50 text-zinc-700 cursor-not-allowed line-through' : 
                            isSelected ? 'bg-amber-600 border-amber-500 text-black shadow-lg shadow-amber-900/40' : 
                            'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800'}
                        `}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              disabled={loading || !horaSeleccionada}
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-lg rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-amber-900/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                'CONFIRMAR RESERVA'
              )}
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Powered by <span className="text-zinc-400 font-semibold tracking-tighter">Franmark Digital</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
