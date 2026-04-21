'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2, AlertTriangle, Globe, MessageCircle, Store } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ConfiguracionBarberia } from '@/types/dashboard'

interface BookingClientProps {
  initialBarberConfig: ConfiguracionBarberia
}

export default function BookingClient({ initialBarberConfig }: BookingClientProps) {
  // App States
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSlots, setShowSlots] = useState(false)
  
  // Form States
  const [nombre, setNombre] = useState('')
  const [phoneSuffix, setPhoneSuffix] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const [clientCortes, setClientCortes] = useState<number | null>(null)

  // Barber/Tenant States
  const [barberConfig] = useState<ConfiguracionBarberia>(initialBarberConfig)

  // REALTIME DISPONIBILIDAD: Suscripción a cambios en turnos
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  useEffect(() => {
    if (!fecha || !barberConfig?.user_id) return

    const channel = supabase
      .channel(`realtime_availability_${fecha}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turnos',
          filter: `barbero_id=eq.${barberConfig.user_id}`
        },
        () => {
          // Si algo cambia en los turnos de este barbero (especialmente en esta fecha), refrescamos
          fetchBookedTurns(fecha)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fecha, barberConfig?.user_id])
  const [diaCerrado, setDiaCerrado] = useState(false)
  const [isFetchingAvailability, setIsFetchingAvailability] = useState(false)
  
  // Validaciones Derivadas
  const isValidPhone = /^(261\d{7}|2634\d{6})$/.test(phoneSuffix)

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
    setHoraSeleccionada('') // RESETEAR HORARIO AL CAMBIAR FECHA
    
    // VALIDACIÓN DE FECHA COMPLETA (Bloquea race conditions por escritura parcial)
    if (nuevaFecha.length < 10) return

    setIsFetchingAvailability(true)
    setAvailableSlots([]) // Limpiar mientras carga
    setBookedSlots([]) // Limpiar ocupados
    setDiaCerrado(false)
    
    try {
      if (barberConfig) {
        // 2. BUSCAR PLANIFICACIÓN ESPECÍFICA PARA ESTA FECHA
        const { data: specificShed, error } = await supabase
          .from('horarios_especificos')
          .select('*')
          .eq('user_id', barberConfig.user_id)
          .eq('fecha', nuevaFecha)
          .maybeSingle()

        if (error) {
          console.error("Supabase Error fetching shed:", error)
        }

        if (specificShed) {
          if (!specificShed.activo) {
            setDiaCerrado(true)
          } else {
            const sortedSlots = (specificShed.slots || []).sort((a: string, b: string) => a.localeCompare(b))
            setAvailableSlots(sortedSlots)
            // CARGA DE TURNOS BLOQUEANTE (Evita queSlots aparezcan y desaparezcan)
            await fetchBookedTurns(nuevaFecha)
          }
        } else {
          // SI NO HAY PLANIFICACIÓN ESPECÍFICA, EL DÍA ESTÁ CERRADO (CONTROL TOTAL)
          setDiaCerrado(true)
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setIsFetchingAvailability(false)
    }
  }

  const fetchBookedTurns = async (date: string) => {
    try {
      const { data } = await supabase
        .from('turnos')
        .select('hora')
        .eq('fecha', date)
        .eq('barbero_id', barberConfig.user_id)
      
      // Normalizar a HH:mm para la comparación en el frontend
      const booked = data?.map(t => {
        const h = t.hora
        return h.substring(0, 5)
      }) || []
      setBookedSlots(booked)
    } catch (error) {
      console.error('Error sincronizando disponibilidad:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!horaSeleccionada || !barberConfig) return

    // VALIDACIÓN ESTRICTA DE TELÉFONO (10 dígitos, 261 o 2634)
    const phoneRegex = /^(261\d{7}|2634\d{6})$/
    if (!phoneRegex.test(phoneSuffix)) {
      toast.error('Formato inválido. Usar 261 o 2634 con 10 dígitos totales')
      return
    }

    setLoading(true)
    
    // NORMALIZACIÓN DE HORA PARA DB (HH:mm:00)
    const timeForDB = horaSeleccionada.length === 5 ? `${horaSeleccionada}:00` : horaSeleccionada

    // VALIDACIÓN DE ÚLTIMO SEGUNDO: Verificar si el turno se ocupó justo ahora
    try {
      const { data: existing } = await supabase
        .from('turnos')
        .select('id')
        .eq('barbero_id', barberConfig.user_id)
        .eq('fecha', fecha)
        .eq('hora', timeForDB)
        .maybeSingle()

      if (existing) {
        toast.error('¡Ups! Alguien acaba de reservar este turno. Por favor elegí otro.')
        await fetchBookedTurns(fecha) // Refrescar lista de ocupados
        setHoraSeleccionada('') // Deseleccionar
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('turnos')
        .insert([
          { 
            barbero_id: barberConfig.user_id,
            cliente_nombre: nombre, 
            cliente_telefono: `+54${phoneSuffix}`, 
            fecha: fecha, 
            hora: timeForDB 
          }
        ])

      if (error) {
        toast.error(`Error: ${error.message}`)
      } else {
        // OPTIMISTIC UPDATE: Bloqueamos el horario localmente antes de mostrar el éxito
        setBookedSlots(prev => [...prev, horaSeleccionada.substring(0, 5)])

        // CONSULTAR FIDELIZACIÓN (Si está activa)
        if (barberConfig.fidelizacion_activa) {
          const { data: clientData } = await supabase
            .from('clientes')
            .select('total_cortes')
            .eq('id_barbero', barberConfig.user_id)
            .eq('telefono', `+54${phoneSuffix}`)
            .single()
          
          setClientCortes(clientData?.total_cortes || 0)
        }

        setSubmitted(true)
      }
    } catch {
      toast.error('Ocurrió un error al procesar tu reserva.')
    } finally {
      setLoading(false)
    }
  }

  const getWhatsAppLink = () => {
    if (!barberConfig?.telefono_barbero) return null
    
    // Normalización del número del barbero para evitar duplicaciones de 54
    const cleanNumber = barberConfig.telefono_barbero.replace(/\D/g, '')
    const finalNumber = cleanNumber.startsWith('54') ? cleanNumber : `54${cleanNumber}`

    let fidelityText = ''
    if (barberConfig.fidelizacion_activa && clientCortes !== null) {
      const currentCortes = clientCortes + 1 // +1 por el que está reservando
      const threshold = barberConfig.fidelizacion_threshold || 10
      const remaining = threshold - (currentCortes % threshold)
      
      if (currentCortes % threshold === 0) {
        fidelityText = `\n\n¡Llevás ${currentCortes} cortes! ¡ESTE TURNO ES TU REGALO! 🎁`
      } else {
        fidelityText = `\n\n¡Llevás ${currentCortes} cortes! Te faltan ${remaining} para tu próximo regalo. 🎁`
      }
    }

    const mensaje = encodeURIComponent(
      `Hola! Soy ${nombre}, acabo de reservar un turno para el ${getFormattedDate(fecha)} a las ${horaSeleccionada}hs desde la web. ¿Me lo confirmas?${fidelityText}`
    )
    return `https://wa.me/${finalNumber}?text=${mensaje}`
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
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />
      
      <header className="mb-2 md:mb-8 text-center relative z-10 px-4 pt-0">
        <div className="flex items-center justify-center mb-2 md:mb-4">
          <div className="w-14 h-14 md:w-28 md:h-28 bg-zinc-900 rounded-full border border-amber-600/20 p-1 shadow-2xl overflow-hidden flex items-center justify-center relative group">
            <div className="w-full h-full rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
              {barberConfig.logo_url ? (
                <img 
                  src={barberConfig.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <Store className="w-6 h-6 md:w-12 md:h-12 text-zinc-800" />
              )}
            </div>
          </div>
        </div>
        <h1 className="text-xl md:text-5xl font-black tracking-tighter uppercase mb-1 break-words px-2">
          {barberConfig.nombre_barberia}
        </h1>
        <div className="flex flex-col items-center gap-1">
          <p className="text-zinc-600 tracking-widest text-[7px] md:text-[8px] font-bold uppercase leading-relaxed">
            RESERVAS ONLINE | BARBERIAPP
          </p>
          
          {barberConfig.google_maps_link && (
            <a 
              href={barberConfig.google_maps_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-500 hover:text-amber-500 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95"
            >
              <Globe className="w-3 h-3" />
              UBICACIÓN
            </a>
          )}
        </div>
      </header>

      <main className="w-full max-w-xl md:max-w-2xl relative z-10 px-2 sm:px-0">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-4 md:p-6 rounded-[2rem] shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input required value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Juan Pérez" className="w-full bg-zinc-800/30 border border-zinc-700/30 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-3 outline-none text-white transition-all text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Teléfono</label>
                <div className="flex items-center bg-zinc-800/30 border border-zinc-700/30 focus-within:border-amber-500/50 rounded-xl overflow-hidden transition-all">
                  <div className="bg-zinc-800 px-3 py-3 border-r border-zinc-700/30 text-zinc-600 font-bold text-[10px]">
                    +54
                  </div>
                  <input 
                    required 
                    value={phoneSuffix} 
                    onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, ''))} 
                    type="tel" 
                    placeholder="2634XXXXXX" 
                    className={`flex-1 min-w-0 bg-transparent py-3 px-3 outline-none text-white font-bold placeholder:text-zinc-700 text-xs border-l ${phoneSuffix.length > 0 && !isValidPhone ? 'border-amber-500/30 text-amber-200' : 'border-zinc-700/50'}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fecha de Reserva</label>
              <div className="relative flex items-center">
                <input 
                  type="date" 
                  required 
                  value={fecha} 
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toLocaleDateString('en-CA')}
                  max={new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')}
                  className="w-full bg-zinc-800/30 border border-zinc-700/30 focus:border-amber-500/50 rounded-xl py-3 px-4 outline-none text-white font-bold transition-all [color-scheme:dark] relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 text-xs" 
                />
                <CalendarIcon className="absolute right-4 w-4 h-4 text-amber-500 z-0" />
              </div>
            </div>

            {/* Selector de Horas */}
            {showSlots && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                  <Clock className="w-3 h-3" /> Seleccioná el Horario
                </label>
                
                {isFetchingAvailability ? (
                  <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                      <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[8px] animate-pulse text-center">
                        Consultando...
                      </p>
                    </div>
                  </div>
                ) : diaCerrado ? (
                  <div className="bg-red-600/5 border border-red-900/40 p-6 rounded-2xl text-center animate-in fade-in duration-500">
                    <div className="w-12 h-12 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tighter italic mb-2">Agenda No Programada</h3>
                    <p className="text-zinc-600 text-[10px] font-medium leading-tight italic max-w-xs mx-auto">No hay turnos disponibles para esta fecha aún.</p>
                  </div>
                ) : (() => {
                  const isToday = fecha === new Intl.DateTimeFormat('en-CA', { 
                    timeZone: 'America/Argentina/Buenos_Aires', 
                    year: 'numeric', month: '2-digit', day: '2-digit' 
                  }).format(new Date())
                  
                  const argNow = new Date()
                  const currentArgTime = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                    hour: '2-digit', minute: '2-digit', hour12: false
                  }).format(argNow)
                  const [currH, currM] = currentArgTime.split(':').map(Number)
                  const currentTotalMinutes = currH * 60 + currM

                  const futureSlots = availableSlots.filter(slot => {
                    if (!isToday) return true
                    const [slotH, slotM] = slot.split(':').map(Number)
                    const slotTotalMinutes = slotH * 60 + slotM
                    return slotTotalMinutes >= currentTotalMinutes + 15
                  })

                  const displaySlots = futureSlots.filter(slot => !bookedSlots.includes(slot))

                  if (isToday && displaySlots.length === 0) {
                    return (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl text-center animate-in fade-in duration-500">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tighter italic mb-2">¡Día Completado!</h3>
                        <p className="text-zinc-500 text-[10px] font-medium leading-tight italic max-w-xs mx-auto">Ya no quedan turnos disponibles para hoy. Consultá los turnos para mañana.</p>
                      </div>
                    )
                  }

                  if (displaySlots.length === 0) {
                     return (
                      <div className="py-12 text-center">
                        <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest italic animate-pulse">Sin turnos disponibles</p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar border-t border-zinc-800/30 pt-3">
                      {displaySlots.map((slot) => {
                          const isSelected = horaSeleccionada === slot
                          return (
                            <button 
                              key={slot} 
                              type="button" 
                              onClick={() => setHoraSeleccionada(slot)} 
                              className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold transition-all border ${isSelected ? 'bg-amber-600 border-amber-500 text-black' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-amber-500/50'}`}
                            >
                              {slot}
                            </button>
                          )
                        })
                      }
                    </div>
                  )
                })() }
              </div>
            )}

            <button disabled={loading || !horaSeleccionada || !isValidPhone} type="submit" className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-sm rounded-xl transition-all shadow-lg disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" /> : 'CONFIRMAR RESERVA'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
