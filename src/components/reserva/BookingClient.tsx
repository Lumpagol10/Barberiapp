'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Scissors, Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2, AlertTriangle, ArrowLeft, Globe, MessageCircle, Store } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface BookingClientProps {
  slug: string
  initialBarberConfig: any
}

export default function BookingClient({ slug, initialBarberConfig }: BookingClientProps) {
  // App States
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSlots, setShowSlots] = useState(false)
  
  // Form States
  const [nombre, setNombre] = useState('')
  const [phoneSuffix, setPhoneSuffix] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  
  // Barber/Tenant States
  const [barberConfig] = useState<any>(initialBarberConfig)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [diaCerrado, setDiaCerrado] = useState(false)

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return ''
    const dateParts = dateStr.split('-').map(Number)
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(date).toUpperCase()
  }

  const handleDateChange = async (nuevaFecha: string) => {
    setFecha(nuevaFecha)
    setShowSlots(true)
    setAvailableSlots([]) // Limpiar mientras carga
    setDiaCerrado(false)
    
    if (barberConfig) {
      // 1. Calcular día de la semana (0: Domingo, 1: Lunes...)
      const dateParts = nuevaFecha.split('-').map(Number)
      const dayOfWeek = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDay()
      
      // 2. BUSCAR PLANIFICACIÓN ESPECÍFICA PARA ESTA FECHA (STRICT MODE)
      const { data: specificShed } = await supabase
        .from('horarios_especificos')
        .select('*')
        .eq('user_id', barberConfig.user_id)
        .eq('fecha', nuevaFecha)
        .single()

      if (specificShed) {
        if (!specificShed.activo) {
          setDiaCerrado(true)
        } else {
          const sortedSlots = (specificShed.slots || []).sort((a: string, b: string) => a.localeCompare(b))
          setAvailableSlots(sortedSlots)
          fetchBookedTurns(nuevaFecha)
        }
      } else {
        // SI NO HAY PLANIFICACIÓN ESPECÍFICA, EL DÍA ESTÁ CERRADO (CONTROL TOTAL)
        setDiaCerrado(true)
      }
    }
  }

  const fetchBookedTurns = async (date: string) => {
    try {
      const { data } = await supabase
        .from('turnos')
        .select('hora')
        .eq('fecha', date)
        .eq('barbero_id', barberConfig.user_id)
      
      const booked = data?.map(t => t.hora.substring(0, 5)) || []
      setBookedSlots(booked)
    } catch (error) {
      console.error('Error sincronizando disponibilidad:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!horaSeleccionada || !barberConfig) return

    setLoading(true)
    
    const { error } = await supabase
      .from('turnos')
      .insert([
        { 
          barbero_id: barberConfig.user_id,
          cliente_nombre: nombre, 
          cliente_telefono: `+54${phoneSuffix}`, 
          fecha: fecha, 
          hora: horaSeleccionada 
        }
      ])

    if (error) {
      toast.error(`Error: ${error.message}`)
      setLoading(false)
    } else {
      setLoading(false)
      setSubmitted(true)
    }
  }

  const getWhatsAppLink = () => {
    if (!barberConfig?.telefono_barbero) return null
    const mensaje = encodeURIComponent(
      `Hola! Soy ${nombre}, acabo de reservar un turno para el ${fecha} a las ${horaSeleccionada}hs desde la web. ¿Me lo confirmas?`
    )
    return `https://wa.me/${barberConfig.telefono_barbero}?text=${mensaje}`
  }

  if (submitted) {
    const waLink = getWhatsAppLink()
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-amber-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">¡Turno Reservado!</h2>
          <div className="space-y-2">
            <p className="text-zinc-400 text-lg">
              Gracias <span className="text-white font-medium">{nombre}</span>. Tu turno en <span className="text-amber-500 font-bold">{barberConfig.nombre_barberia}</span> ha sido registrado.
            </p>
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-green-900/20">
              <Phone className="w-6 h-6 fill-current" /> CONFIRMAR POR WHATSAPP
            </a>
          )}
          <button onClick={() => setSubmitted(false)} className="w-full py-4 bg-zinc-800 text-zinc-300 font-bold rounded-xl">Nueva Reserva</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Optimizaciones de Red para Google Maps */}
      <link rel="preconnect" href="https://maps.google.com" />
      <link rel="preconnect" href="https://maps.gstatic.com" />
      <link rel="preconnect" href="https://www.google.com" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[120px]" />
      
      <header className="mb-10 text-center relative z-10 px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 rounded-full border-4 border-amber-600/20 p-2 shadow-2xl overflow-hidden flex items-center justify-center relative group">
            <div className="w-full h-full rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {barberConfig.logo_url ? (
                <img src={barberConfig.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 md:w-14 md:h-14 text-zinc-800" />
              )}
            </div>
          </div>
        </div>
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-4 break-words px-2">
          {barberConfig.nombre_barberia}
        </h1>
        <div className="flex flex-col items-center gap-6">
          <p className="text-zinc-500 tracking-wider md:tracking-widest text-[10px] md:text-xs font-bold uppercase leading-relaxed max-w-[280px] md:max-w-none">
            RESERVAS ONLINE | POTENCIADO POR BARBERIAPP
          </p>
          
          {barberConfig.google_maps_link && (
            <a 
              href={barberConfig.google_maps_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-3 px-10 py-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 shadow-2xl active:scale-95"
            >
              <Globe className="w-4 h-4" />
              CÓMO LLEGAR
            </a>
          )}
        </div>
      </header>

      <main className="w-full max-w-2xl relative z-10 px-2 sm:px-0">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-5 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Tu Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input required value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Juan Pérez" className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none text-white transition-all text-sm md:text-base" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Tu Teléfono</label>
                <div className="flex items-center bg-zinc-800/50 border border-zinc-700/50 focus-within:border-amber-500/50 rounded-2xl overflow-hidden transition-all">
                  <div className="bg-zinc-800 px-4 md:px-5 py-4 border-r border-zinc-700/50 text-zinc-500 font-black text-xs md:text-sm">
                    +54
                  </div>
                  <input 
                    required 
                    value={phoneSuffix} 
                    onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, ''))} 
                    type="tel" 
                    placeholder="2634XXXXXX" 
                    className="flex-1 min-w-0 bg-transparent py-4 px-4 md:px-6 outline-none text-white font-bold placeholder:text-zinc-700 text-sm md:text-base" 
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1 mt-1">
                  Ej: 2634XXXXXX - 261XXXXXXX
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Fecha</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="date" 
                  required 
                  value={fecha} 
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toLocaleDateString('en-CA')}
                  max={new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-5 px-6 outline-none text-white font-bold transition-all [color-scheme:dark]" 
                />
              </div>
            </div>

            {/* Selector de Horas */}
            {showSlots && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  <Clock className="w-3 h-3" /> Seleccioná el Horario
                </label>
                
                {diaCerrado ? (
                  <div className="bg-red-600/10 border border-red-900/40 p-12 rounded-[2.5rem] text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Agenda No Programada</h3>
                    <p className="text-zinc-500 font-medium italic max-w-xs mx-auto">El barbero aún no ha confirmado su disponibilidad para este día. Por favor, intentá con otra fecha o consultale por WhatsApp.</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="p-4 bg-zinc-800 rounded-2xl w-fit mx-auto shadow-xl">
                      <MessageCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="space-y-2 px-2">
                      <p className="text-white font-black uppercase tracking-tighter text-xl italic leading-none">
                        Agenda en preparación
                      </p>
                      <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed italic">
                        El barbero aún no ha programado los turnos para este día. <br className="hidden sm:block" />
                        Seleccioná otra fecha o consultá disponibilidad por WhatsApp.
                      </p>
                    </div>
                    <a 
                      href={`https://wa.me/${barberConfig.telefono_barbero?.replace('+', '')}?text=Hola!%20Vi%20que%20no%20hay%20turnos%20cargados%20para%20el%20día%20${getFormattedDate(fecha)},%20¿tenés%20disponibilidad?`}
                      target="_blank"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase text-[10px] md:text-xs tracking-widest"
                    >
                      <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                      CONSULTAR POR WHATSAPP
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-t border-zinc-800/30 pt-4">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot)
                      const isSelected = horaSeleccionada === slot
                      return (
                        <button key={slot} type="button" disabled={isBooked} onClick={() => setHoraSeleccionada(slot)} className={`py-4 rounded-xl text-center text-xs md:text-sm font-bold transition-all border ${isBooked ? 'bg-zinc-800/20 border-zinc-800/50 text-zinc-700 cursor-not-allowed line-through' : isSelected ? 'bg-amber-600 border-amber-500 text-black shadow-lg shadow-amber-900/40' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800'}`}>
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <button disabled={loading || !horaSeleccionada} type="submit" className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-lg rounded-2xl transition-all shadow-xl shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" /> : 'CONFIRMAR RESERVA'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
