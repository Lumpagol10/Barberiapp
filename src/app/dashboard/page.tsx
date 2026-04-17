'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, LogOut, Scissors, Users, Calendar, TrendingUp, Settings, ExternalLink, Phone, Clock, Type as TypeIcon, MessageCircle, DollarSign, Share2, Store, Loader2, User as UserIcon, Camera, Trash2, Globe, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cropper, { Area } from 'react-easy-crop'
import { getCroppedImg } from '@/lib/imageUtils'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'config' | 'programar' | 'finanzas'>('agenda')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [turns, setTurns] = useState<any[]>([])
  const [viewDate, setViewDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
  })
  
  // Estados para Finanzas
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null)
  const [checkoutPrice, setCheckoutPrice] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [financesDate, setFinancesDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  })
  const [financesMonth, setFinancesMonth] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit' }).format(new Date())
  })
  const [historyFilterMode, setHistoryFilterMode] = useState<'day' | 'month'>('day')
  const [financesData, setFinancesData] = useState<any>({
    dailyTotal: 0,
    monthlyTotal: 0,
    annualTotal: 0,
    history: []
  })
  
  // Estados para Agenda Inteligente
  const [masterRoutine, setMasterRoutine] = useState<any[]>([]) // La plantilla base (L-D)
  const [planningSchedule, setPlanningSchedule] = useState<any[]>([]) // Los 7-14 días concretos
  const [showMasterRoutine, setShowMasterRoutine] = useState(false)
  
  // States for Editing Config
  const [editNombre, setEditNombre] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editMaps, setEditMaps] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null)
  const [editApertura, setEditApertura] = useState('')
  const [editCierre, setEditCierre] = useState('')
  const [editIntervalo, setEditIntervalo] = useState(30)
  
  // Estados para Excepciones por Fecha
  const [exceptionDate, setExceptionDate] = useState('')
  const [exceptionSchedule, setExceptionSchedule] = useState<{activo: boolean, slots: string[]}>({ activo: true, slots: [] })

  // Estados para el Cropper de Logo
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/auth')
        return
      }
      setUser(user)
      fetchData(user.id)
      fetchFinances(user.id)
    }
    checkUser()
  }, []) // Solo al montar

  // Refrescar Datos al cambiar fecha de turnos
  useEffect(() => {
    if (user?.id) fetchData(user.id)
  }, [viewDate])

  // Refrescar Finanzas al cambiar filtros de finanzas
  useEffect(() => {
    if (user?.id) fetchFinances(user.id)
  }, [financesDate, financesMonth, historyFilterMode])

  const fetchFinances = async (userId: string) => {
    const firstDayOfMonth = financesMonth + '-01'
    const dateObj = new Date(financesMonth + '-01T12:00:00')
    const lastDayOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).toISOString().split('T')[0]
    const firstDayOfYear = new Date().getFullYear() + '-01-01'

    // Consulta Independiente: Total Diario
    const { data: dailyData } = await supabase
      .from('turnos')
      .select('precio')
      .eq('barbero_id', userId)
      .eq('estado', 'completado')
      .eq('fecha', financesDate)

    // Consulta Independiente: Total Mensual
    const { data: monthlyData } = await supabase
      .from('turnos')
      .select('precio')
      .eq('barbero_id', userId)
      .eq('estado', 'completado')
      .gte('fecha', firstDayOfMonth)
      .lte('fecha', lastDayOfMonth)

    // Consulta Independiente: Total Anual
    const { data: annualData } = await supabase
      .from('turnos')
      .select('precio')
      .eq('barbero_id', userId)
      .eq('estado', 'completado')
      .gte('fecha', firstDayOfYear)

    // Consulta de Historial: Según el modo de filtro activo
    const historyQuery = supabase
      .from('turnos')
      .select('*')
      .eq('barbero_id', userId)
      .eq('estado', 'completado')

    if (historyFilterMode === 'day') {
      historyQuery
        .eq('fecha', financesDate)
        .order('hora', { ascending: true }) // Cronológico
    } else {
      historyQuery
        .gte('fecha', firstDayOfMonth)
        .lte('fecha', lastDayOfMonth)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
    }

    const { data: historyData } = await historyQuery.limit(50)

    const dailyTotal = dailyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
    const monthlyTotal = monthlyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
    const annualTotal = annualData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0

    setFinancesData({
      dailyTotal,
      monthlyTotal,
      annualTotal,
      history: historyData || []
    })
  }

  const fetchData = async (userId: string) => {
    // Solo mostramos loading total si no hay datos previos para evitar flashes
    if (!config) setLoading(true)
    try {
      const { data: configData } = await supabase
        .from('configuracion_barberia')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (configData) {
        setConfig(configData)
        setEditNombre(configData.nombre_barberia)
        setEditPhone(configData.telefono_barbero.replace('+54', ''))
        setEditMaps(configData.google_maps_link || '')
        setEditLogoUrl(configData.logo_url || null)
        setEditApertura(configData.hora_apertura)
        setEditCierre(configData.hora_cierre)
        setEditIntervalo(configData.intervalo_minutos)

        // Cargar Horarios Flexibles
        const { data: scheduleData } = await supabase
          .from('horarios_barberia')
          .select('*')
          .eq('user_id', userId)
          .order('dia_semana', { ascending: true })

        if (scheduleData && scheduleData.length > 0) {
          setMasterRoutine(scheduleData)
        } else {
          // Migración automática: Crear base L-S activa, D inactiva
          const initial = [0,1,2,3,4,5,6].map(dia => ({
            dia_semana: dia,
            activo: dia !== 0,
            slots: ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"]
          }))
          setMasterRoutine(initial)
        }

        // --- CARGAR PLANIFICACIÓN DE LOS PRÓXIMOS 7 DÍAS ---
        const today = new Date()
        const next7Days: string[] = []
        for (let i = 0; i < 7; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          next7Days.push(d.toLocaleDateString('en-CA'))
        }

        const { data: exceptionsData } = await supabase
          .from('horarios_especificos')
          .select('*')
          .eq('user_id', userId)
          .in('fecha', next7Days)

        const finalPlanning = next7Days.map(fechaStr => {
           const specific = exceptionsData?.find(e => e.fecha === fechaStr)
           if (specific) return { ...specific, isNew: false }
           
           // Si no hay específico, pre-cargamos de la rutina
           const dObj = new Date(fechaStr + 'T12:00:00')
           const routine = (scheduleData || []).find(r => r.dia_semana === dObj.getDay())
           return {
             fecha: fechaStr,
             activo: false, // Por defecto APAGADO hasta que el barbero lo confirme (Batch Planning)
             slots: routine?.slots || [],
             isNew: true
           }
        })
        setPlanningSchedule(finalPlanning)

        const { data: turnsData } = await supabase
          .from('turnos')
          .select('*')
          .eq('barbero_id', userId)
          .eq('fecha', viewDate)
          .eq('estado', 'pendiente')
          .order('hora', { ascending: true })
        
        setTurns(turnsData || [])
      } else {
        router.push('/dashboard/onboarding')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Generar nuevo slug si el nombre cambió
    const newSlug = editNombre.toLowerCase().trim().replace(/\s+/g, '-')
    
    const { error } = await supabase
      .from('configuracion_barberia')
      .update({
        nombre_barberia: editNombre,
        slug: newSlug,
        telefono_barbero: `+54${editPhone}`,
        google_maps_link: editMaps,
        logo_url: editLogoUrl
      })
      .eq('user_id', user.id)

    if (error) {
      alert(`Error al actualizar: ${error.message}`)
    } else {
      await fetchData(user.id)
      alert('Perfil actualizado con éxito')
      setActiveTab('agenda') // Volver a la página principal tras guardar
    }
    setSaving(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setTempImage(reader.result as string)
      setShowCropper(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleSaveCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return
    setSaving(true)
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels)
      if (!croppedBlob) throw new Error('Error al procesar el recorte')

      const fileName = `${user.id}-${Date.now()}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('barberia_logos')
        .upload(fileName, croppedBlob)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('barberia_logos')
        .getPublicUrl(fileName)

      // Guardar en la base de datos inmediatamente para evitar pérdidas
      const { error: dbError } = await supabase
        .from('configuracion_barberia')
        .update({ logo_url: publicUrl })
        .eq('user_id', user.id)

      if (dbError) throw dbError

      setEditLogoUrl(publicUrl)
      // Actualizar config local para que el sidebar se vea al toque
      setConfig((prev: any) => prev ? { ...prev, logo_url: publicUrl } : prev)
      
      setShowCropper(false)
      setTempImage(null)
      alert('📸 Logo guardado con éxito. Ya puedes seguir navegando.')
    } catch (error: any) {
      alert(`Error al subir logo: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateMasterRoutine = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('horarios_barberia')
        .upsert(
          masterRoutine.map(s => ({
            user_id: user.id,
            dia_semana: s.dia_semana,
            activo: s.activo,
            slots: s.slots || []
          })),
          { onConflict: 'user_id,dia_semana' }
        )

      if (error) throw error
      alert('✅ Rutina Maestra actualizada')
      setShowMasterRoutine(false)
      fetchData(user.id) // Refrescar planning con la nueva rutina
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePlanning = async () => {
    setSaving(true)
    try {
      // Guardamos todos los días de la planificación actual como excepciones
      const { error } = await supabase
        .from('horarios_especificos')
        .upsert(
          planningSchedule.map(s => ({
            user_id: user.id,
            fecha: s.fecha,
            activo: s.activo,
            slots: s.slots || []
          })),
          { onConflict: 'user_id,fecha' }
        )

      if (error) throw error
      alert('✅ Agenda Semanal confirmada y publicada')
      fetchData(user.id)
    } catch (error: any) {
      alert(`Error al guardar agenda: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addPlanningSlot = (idx: number) => {
    const newSched = [...planningSchedule]
    const daySlots = [...(newSched[idx].slots || [])]
    let nextTime = "09:00"
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1]
      const [h, m] = last.split(':').map(Number)
      nextTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    newSched[idx].slots = [...daySlots, nextTime]
    setPlanningSchedule(newSched)
  }

  const removePlanningSlot = (dayIdx: number, slotIdx: number) => {
    const newSched = [...planningSchedule]
    newSched[dayIdx].slots = newSched[dayIdx].slots.filter((_: any, i: number) => i !== slotIdx)
    setPlanningSchedule(newSched)
  }

  const updatePlanningSlot = (dayIdx: number, slotIdx: number, newValue: string) => {
    const newSched = [...planningSchedule]
    newSched[dayIdx].slots[slotIdx] = newValue
    setPlanningSchedule(newSched)
  }

  const copyRoutineToPlanning = (dayIdx: number) => {
    const dayObj = new Date(planningSchedule[dayIdx].fecha + 'T12:00:00')
    const routine = masterRoutine.find(r => r.dia_semana === dayObj.getDay())
    if (routine) {
      const newSched = [...planningSchedule]
      newSched[dayIdx].slots = [...routine.slots]
      newSched[dayIdx].activo = true
      setPlanningSchedule(newSched)
    }
  }

  // Cargar Excepción por Fecha
  useEffect(() => {
    if (user?.id && exceptionDate) {
      const fetchException = async () => {
        const { data } = await supabase
          .from('horarios_especificos')
          .select('*')
          .eq('user_id', user.id)
          .eq('fecha', exceptionDate)
          .single()

        if (data) {
          setExceptionSchedule({ activo: data.activo, slots: data.slots || [] })
        } else {
          // Fallback visual: Cargar la rutina de ese día de la semana como base
          const dayOfWeek = new Date(exceptionDate + 'T12:00:00').getDay()
          const routine = masterRoutine.find((s: any) => s.dia_semana === dayOfWeek)
          setExceptionSchedule({ 
            activo: routine?.activo ?? true, 
            slots: routine?.slots ?? [] 
          })
        }
      }
      fetchException()
    }
  }, [exceptionDate, user?.id, masterRoutine])

  const handleSaveException = async () => {
    if (!exceptionDate) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('horarios_especificos')
        .upsert({
          user_id: user.id,
          fecha: exceptionDate,
          activo: exceptionSchedule.activo,
          slots: exceptionSchedule.slots
        }, { onConflict: 'user_id,fecha' })

      if (error) throw error
      alert(`✅ Excepción para el ${exceptionDate} guardada`)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addExceptionSlot = () => {
    const daySlots = [...(exceptionSchedule.slots || [])]
    let nextTime = "09:00"
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1]
      const [h, m] = last.split(':').map(Number)
      nextTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    setExceptionSchedule({ ...exceptionSchedule, slots: [...daySlots, nextTime] })
  }

  const handleFinish = (id: string) => {
    setSelectedTurnId(id)
    setCheckoutPrice('')
    setShowCheckoutModal(true)
  }

  const confirmCheckout = async (omitValue: boolean = false) => {
    if (!selectedTurnId) return
    setSaving(true)
    
    const finalPrice = omitValue ? 0 : Number(checkoutPrice)
    
    const { error } = await supabase
      .from('turnos')
      .update({ 
        estado: 'completado', 
        precio: finalPrice 
      })
      .eq('id', selectedTurnId)
      .eq('barbero_id', user.id)

    if (!error) {
      setTurns(prev => prev.filter(t => t.id !== selectedTurnId))
      setShowCheckoutModal(false)
      fetchFinances(user.id)
    } else {
      alert(`Error al cobrar: ${error.message}`)
    }
    setSaving(false)
  }
  // Sincronizar título del navegador dinámicamente
  useEffect(() => {
    if (config?.nombre_barberia) {
      document.title = `${config.nombre_barberia.toUpperCase()} | PANEL DE CONTROL`
    }
  }, [config?.nombre_barberia])

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleShareWhatsApp = () => {
    const shareUrl = `${window.location.origin}/reserva/${config?.slug}`
    const text = `¡Hola! 💈 Te paso mi nuevo link de reservas online para que elijas tu día y horario en un toque. ¡Nos vemos en la barbería! ✂️ ${shareUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    setShowShareModal(false)
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/reserva/${config?.slug}`
    navigator.clipboard.writeText(shareUrl)
    alert('✅ Link copiado al portapapeles')
    setShowShareModal(false)
  }

  const handleShareNative = async () => {
    const shareUrl = `${window.location.origin}/reserva/${config?.slug}`
    const shareText = `¡Hola! 💈 Te paso mi nuevo link de reservas online para que elijas tu día y horario en un toque. ¡Nos vemos en la barbería! ✂️ ${shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: config?.nombre_barberia,
          text: shareText,
        })
      } catch (err) {
        console.log('Error compartiendo:', err)
      }
    } else {
      handleCopyLink()
    }
    setShowShareModal(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/auth')
  }

  const diasLetras = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const getFormattedDate = () => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(new Date()).toUpperCase()
  }

  const getShedDate = (diaSemana: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    // Distancia al día objetivo (0-6 días adelante)
    let diff = diaSemana - currentDay
    if (diff < 0) diff += 7
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + diff)
    return targetDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  }

  // Componente de Esqueleto Sutil
  const SkeletonPulse = ({ className }: { className: string }) => (
    <div className={`bg-zinc-800/50 animate-pulse rounded-2xl ${className}`} />
  )

  const getOrderedPlanning = () => {
    return planningSchedule
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex pb-12 font-sans overflow-x-hidden transition-colors duration-500">
      {/* Sidebar Fijo */}
      <aside className="hidden lg:flex w-80 flex-col bg-zinc-900/50 border-r border-zinc-800/50 p-6 backdrop-blur-md sticky top-0 h-screen">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl shadow-lg shrink-0 flex items-center justify-center overflow-hidden border border-amber-500/20 bg-zinc-900">
              {config?.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                  <Store className="w-6 h-6 text-zinc-500" />
                </div>
              )}
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic truncate flex-1 min-w-0">{config?.nombre_barberia || 'BARBERIAPP'}</span>
          </div>
          <button 
            onClick={handleShare}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-amber-500 rounded-xl transition-all border border-zinc-700/50 shrink-0"
            title="Compartir link de reserva"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'agenda' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" /> Turnos Hoy
          </button>
          
          <button 
            onClick={() => setActiveTab('programar')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'programar' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Clock className="w-5 h-5" /> Programar Agenda
          </button>

          <button 
            onClick={() => setActiveTab('finanzas')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'finanzas' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <DollarSign className="w-5 h-5" /> Finanzas
          </button>


          
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all border uppercase text-sm tracking-wider ${activeTab === 'config' ? 'bg-amber-600/10 text-amber-500 border-amber-500/10' : 'text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Mi Perfil
          </button>
        </nav>

        <div className="flex items-center gap-3 px-4 py-3 text-zinc-700 font-bold uppercase text-[10px] tracking-widest mt-auto border-t border-zinc-800/30 pt-6">
          <UserIcon className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{user?.email}</span>
        </div>
      </aside>

      {/* Navegación Mobile Compacta */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 px-3 py-2 rounded-full flex items-center gap-1 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('agenda')} className={`p-3 rounded-full transition-all ${activeTab === 'agenda' ? 'bg-amber-600 text-black' : 'text-zinc-500'}`}><Calendar className="w-5 h-5" /></button>
        <button onClick={() => setActiveTab('finanzas')} className={`p-3 rounded-full transition-all ${activeTab === 'finanzas' ? 'bg-emerald-600 text-black' : 'text-zinc-500'}`}><DollarSign className="w-5 h-5" /></button>
        <button onClick={handleShare} className="p-3 text-amber-500 bg-amber-600/10 rounded-full"><Share2 className="w-5 h-5" /></button>
        <button onClick={() => setActiveTab('config')} className={`p-3 rounded-full transition-all ${activeTab === 'config' ? 'bg-amber-600 text-black' : 'text-zinc-500'}`}><Settings className="w-5 h-5" /></button>
        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
        <div className="p-3 text-zinc-700"><UserIcon className="w-5 h-5" /></div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-12 w-full max-w-[100vw] relative">
        {loading && !config ? (
          <div className="animate-in fade-in duration-500 space-y-12">
             <header className="flex flex-col md:flex-row justify-between gap-8 mb-12">
               <div className="space-y-4">
                 <SkeletonPulse className="h-12 w-64 md:w-96" />
                 <SkeletonPulse className="h-4 w-48" />
               </div>
               <SkeletonPulse className="h-32 w-48" />
             </header>
             <div className="space-y-6">
                <SkeletonPulse className="h-20 w-full" />
                <SkeletonPulse className="h-96 w-full" />
             </div>
          </div>
        ) : (
          <>
            {activeTab === 'agenda' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-amber-500/20 p-1.5 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden bg-zinc-900/50 backdrop-blur-sm">
                   {config?.logo_url ? (
                      <img src={config.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                   ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center rounded-2xl">
                         <Store className="w-10 h-10 text-zinc-600" />
                      </div>
                   )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic leading-tight">HOY ES {getFormattedDate()}</h1>
                  <div className="flex items-center gap-4">
                    <p className="text-zinc-500 text-xs sm:text-base font-medium italic">Gestión operativa para <span className="text-amber-500 font-bold">{config?.nombre_barberia}</span></p>
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Compartir Link
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2rem] min-w-[140px] shadow-xl">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Pendientes Hoy</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-amber-500 leading-none">{turns.length}</span>
                  <Users className="w-5 h-5 text-zinc-700 mb-1" />
                </div>
              </div>
            </header>

            <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-zinc-900/20">
                <div className="w-full sm:w-auto">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">
                    {viewDate === new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) 
                      ? 'Próximos Turnos' 
                      : `Turnos del ${new Date(viewDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`
                    }
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

              {/* Vista Mobile: Cards (Agenda) */}
              <div className="block md:hidden">
                {turns.length > 0 ? (
                  <div className="divide-y divide-zinc-800/30">
                    {turns.map((turn) => (
                      <div key={turn.id} className="p-6 space-y-4 active:bg-white/[0.02] transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-lg text-zinc-100 uppercase tracking-tight">{turn.cliente_nombre}</div>
                            <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-2 mt-1 uppercase"><Phone className="w-3 h-3" /> {turn.cliente_telefono}</div>
                          </div>
                          <a 
                            href={`https://wa.me/${turn.cliente_telefono.replace('+', '')}`}
                            target="_blank"
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
                            onClick={() => handleFinish(turn.id)}
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

              {/* Vista Desktop: Tabla (Agenda) */}
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
                                <div className="text-xs text-zinc-500 font-bold flex items-center gap-2"><Phone className="w-3 h-3 text-zinc-700" /> {turn.cliente_telefono}</div>
                              </div>
                              <a 
                                href={`https://wa.me/${turn.cliente_telefono.replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-black rounded-full transition-all active:scale-90"
                                title="Contactar por WhatsApp"
                              >
                                <svg 
                                  className="w-5 h-5 fill-current" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
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
                              onClick={() => handleFinish(turn.id)}
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
        )}

        {activeTab === 'programar' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Agenda Semanal</h1>
                <p className="text-zinc-500 font-medium italic">Confirmá los días que vas a trabajar esta semana</p>
              </div>
              <button 
                onClick={() => setShowMasterRoutine(!showMasterRoutine)}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all italic flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Configurar Rutina Maestra
              </button>
            </header>

            {/* MODAL / SECCIÓN RUTINA MAESTRA */}
            {showMasterRoutine && (
              <div className="bg-zinc-900/80 border border-amber-600/20 rounded-[2.5rem] p-8 lg:p-12 mb-12 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">⚙️ Rutina Maestra (Plantilla base)</h3>
                  <button onClick={() => setShowMasterRoutine(false)} className="text-zinc-500">Cerrar</button>
                </div>
                <p className="text-zinc-500 text-sm mb-10 italic">Los horarios que definas acá servirán de base para las nuevas semanas, pero tenés que confirmarlos en la 'Agenda Semanal' para que el cliente los vea.</p>
                
                <div className="space-y-4">
                  {masterRoutine.map((r, idx) => (
                    <div key={r.dia_semana} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950/30 rounded-2xl border border-zinc-900">
                      <div className="flex items-center gap-4 min-w-[150px]">
                        <span className="font-black italic uppercase text-zinc-400">{diasLetras[r.dia_semana]}</span>
                        <button 
                          onClick={() => {
                             const newR = [...masterRoutine]
                             newR[idx].activo = !newR[idx].activo
                             setMasterRoutine(newR)
                          }}
                          className={`w-10 h-6 rounded-full relative transition-all ${r.activo ? 'bg-amber-600' : 'bg-zinc-800'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${r.activo ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                         {r.slots.map((s: string, sIdx: number) => (
                           <input 
                            key={sIdx}
                            type="time" 
                            value={s}
                            onChange={(e) => {
                               const newR = [...masterRoutine]
                               newR[idx].slots[sIdx] = e.target.value
                               setMasterRoutine(newR)
                            }}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-white [color-scheme:dark]"
                           />
                         ))}
                         <button 
                          onClick={() => {
                             const newR = [...masterRoutine]
                             newR[idx].slots.push("09:00")
                             setMasterRoutine(newR)
                          }}
                          className="px-2 py-1 text-amber-500 font-bold"
                         >+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpdateMasterRoutine}
                  disabled={saving}
                  className="mt-8 w-full py-4 bg-amber-600 text-black font-black uppercase rounded-xl"
                >Guardar Rutina Maestra</button>
              </div>
            )}

            <div className="mb-10 p-6 bg-amber-600/10 border border-amber-600/20 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 bg-amber-600 rounded-xl text-black shadow-lg shadow-amber-900/40">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-amber-500 text-sm font-black uppercase tracking-tighter leading-tight italic">
                Solo los días que marques como "ACTIVOS" y guardes serán visibles para tus clientes en la web de reserva.
              </p>
            </div>

            <div className="grid gap-6 mb-12">
              {getOrderedPlanning().map((dia, idx) => (
                <div key={dia.fecha} className={`bg-zinc-900/40 border transition-all rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-8 ${dia.activo ? 'border-emerald-500/20 shadow-lg mb-4' : 'border-white/5 opacity-60'}`}>
                  {/* Header del Día */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black uppercase tracking-tight italic">
                          {diasLetras[new Date(dia.fecha + 'T12:00:00').getDay()]} {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                        </h3>
                        {dia.fecha === new Date().toLocaleDateString('en-CA') && (
                          <span className="px-3 py-1 bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-900/40 animate-pulse">
                            HOY
                          </span>
                        )}
                        {dia.isNew && <span className="text-[10px] text-zinc-500 font-bold italic tracking-tighter">(Usando plantilla)</span>}
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${dia.activo ? 'text-emerald-500' : 'text-zinc-600'}`}>
                        {dia.activo ? '🟢 Publicado en la web' : '🔴 No programado (Invisible)'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {dia.activo === false && (
                         <button 
                          onClick={() => copyRoutineToPlanning(idx)}
                          className="px-4 py-2 text-[10px] font-bold text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-all"
                         >Cargar Rutina</button>
                      )}
                      
                      {/* Switch de Activo */}
                      <button 
                        type="button"
                        onClick={() => {
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {(dia.slots || []).map((slot: string, slotIdx: number) => (
                          <div key={slotIdx} className="group relative">
                            <input 
                              type="time" 
                              value={slot} 
                              onChange={(e) => updatePlanningSlot(idx, slotIdx, e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl py-4 px-4 text-xl font-black text-center [color-scheme:dark] transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                            <button 
                              onClick={() => removePlanningSlot(idx, slotIdx)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => addPlanningSlot(idx)}
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl py-4 transition-all text-zinc-600 hover:text-emerald-500"
                        >
                          <span className="text-2xl font-black">+</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Agregar</span>
                        </button>
                      </div>

                      {(dia.slots || []).length === 0 && (
                        <div className="py-12 text-center bg-zinc-950/20 rounded-[2rem] border border-dashed border-zinc-800">
                          <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No hay horarios cargados para este día</p>
                          <button 
                            onClick={() => addPlanningSlot(idx)}
                            className="mt-4 text-emerald-500 font-black uppercase text-[10px] underline tracking-widest"
                          >
                            Hacé clic acá para empezar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end sticky bottom-6 z-50">
              <button 
                onClick={handleUpdatePlanning}
                disabled={saving}
                className="w-full md:w-auto px-16 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-2xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-tighter"
              >
                {saving ? 'GUARDANDO...' : '🚀 PUBLICAR AGENDA SEMANAL'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'finanzas' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <header className="mb-10 lg:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Finanzas y Caja</h1>
              <p className="text-zinc-500 text-sm sm:text-base font-medium italic">Control de ingresos y balance de servicios</p>
            </header>

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

              {/* Vista Mobile: Cards (Finanzas) */}
              <div className="block md:hidden">
                {financesData.history.length > 0 ? (
                  <div className="divide-y divide-zinc-800/30">
                    {financesData.history.map((item: any) => (
                      <div key={item.id} className="p-6 flex justify-between items-center active:bg-white/[0.02] transition-colors">
                        <div>
                          <div className="font-black text-zinc-100 uppercase tracking-tight">{item.cliente_nombre}</div>
                          <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">
                            {new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} • {item.hora.substring(0, 5)}hs
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-500 text-lg">
                            +${(Number(item.precio) || 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center px-8">
                    <div className="text-zinc-700 text-3xl font-black uppercase opacity-20 mb-2 italic">Sin Ingresos</div>
                    <p className="text-zinc-600 text-xs font-medium italic uppercase tracking-widest">Esperando el primer cobro</p>
                  </div>
                )}
              </div>

              {/* Vista Desktop: Tabla (Finanzas) */}
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
                      financesData.history.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <span className="font-black text-zinc-100 uppercase tracking-tight">{item.cliente_nombre}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-xs text-zinc-500 font-bold">
                              {new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} - {item.hora.substring(0, 5)}hs
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="font-black text-emerald-500 text-lg group-hover:scale-110 transition-transform inline-block">
                              +${(Number(item.precio) || 0).toLocaleString('es-AR')}
                            </span>
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
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-10 lg:mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 italic">Mi Perfil</h1>
              <p className="text-zinc-500 font-medium italic">Personalizá tu marca y puntos de contacto</p>
            </header>

            <form onSubmit={handleUpdateConfig} className="space-y-8 sm:space-y-10">
              {/* Branding y Logo */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
                  {/* Uploader Circular Pro */}
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full border-4 border-amber-600/20 p-2 relative shadow-[0_0_50px_rgba(217,119,6,0.1)]">
                      <div className="w-full h-full rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl relative">
                        {editLogoUrl ? (
                          <img src={editLogoUrl} alt="Logo Preview" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                             <Store className="w-12 lg:w-20 h-12 lg:h-20 text-zinc-800" />
                             <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Sin Logo</span>
                          </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm border-2 border-amber-500/50 border-dashed m-1">
                          <Camera className="w-8 h-8 text-amber-500 mb-2" />
                          <span className="text-[10px] font-black uppercase text-amber-500 tracking-tighter">Subir Logo</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {editLogoUrl && (
                      <button 
                        type="button"
                        onClick={() => setEditLogoUrl(null)}
                        className="absolute -top-1 -right-1 bg-red-600 p-2.5 rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all z-20 border-2 border-zinc-900"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-8 w-full">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1 flex items-center gap-2">
                        <TypeIcon className="w-3 h-3" /> Nombre de la Barbería
                      </label>
                      <input 
                        required 
                        value={editNombre} 
                        onChange={(e) => setEditNombre(e.target.value)} 
                        className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-amber-500/50 rounded-2xl py-6 px-8 outline-none text-white font-black text-2xl lg:text-4xl italic transition-all shadow-inner tracking-tighter placeholder:text-zinc-800" 
                        placeholder="NOMBRE DE TU NEGOCIO"
                      />
                    </div>

                    {/* Link de Reserva Dinámico Pro */}
                    <div className="bg-emerald-600/5 border border-emerald-600/10 rounded-3xl p-6 lg:p-8 space-y-5 shadow-inner">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                         <Globe className="w-3 h-3" /> Tu Link Profesional de Reservas
                       </label>
                       <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-6 py-5 text-emerald-500 font-black text-sm md:text-base truncate shadow-inner tracking-tighter">
                             {`${typeof window !== 'undefined' ? window.location.origin : ''}/reserva/${config?.slug}`}
                          </div>
                          <div className="flex gap-3">
                             <button 
                                type="button"
                                onClick={() => {
                                    const url = `${window.location.origin}/reserva/${config?.slug}`
                                    navigator.clipboard.writeText(url)
                                    alert('✅ Link de reserva copiado')
                                 }}
                                className="flex-1 sm:flex-none p-5 bg-emerald-600 text-black rounded-xl hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                                title="Copiar Link"
                             >
                                <Copy className="w-6 h-6" />
                             </button>
                             <button 
                                type="button"
                                onClick={handleShare}
                                className="flex-1 sm:flex-none p-5 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700/50"
                                title="Compartir"
                             >
                                <Share2 className="w-6 h-6" />
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Contacto */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-emerald-500">
                  <div className="p-2.5 sm:p-3 bg-emerald-600/10 rounded-xl sm:rounded-2xl"><Phone className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                  <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Canal de Ventas</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp de Reservas</label>
                    <div className="flex bg-zinc-950/50 border border-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
                      <div className="bg-zinc-900 px-4 sm:px-6 py-4 sm:py-5 border-r border-zinc-800 text-zinc-500 font-black text-xs sm:text-sm">+54</div>
                      <input 
                        required 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))} 
                        className="flex-1 bg-transparent py-4 sm:py-5 px-5 sm:px-6 outline-none text-white font-bold text-sm sm:text-base" 
                        placeholder="2634XXXXXX"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Ubicación (Google Maps)</label>
                    <input 
                      value={editMaps} 
                      onChange={(e) => setEditMaps(e.target.value)} 
                      placeholder="Pega aquí el link de tu ubicación"
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 outline-none text-white font-bold transition-all text-sm sm:text-base" 
                    />
                  </div>
                </div>
              </div>

              {/* Sección Cuenta y Seguridad */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-zinc-400">
                  <div className="p-2.5 sm:p-3 bg-zinc-800 rounded-xl sm:rounded-2xl"><UserIcon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                  <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">Cuenta y Seguridad</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3 opacity-60">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email de la Cuenta (No Editable)</label>
                    <div className="w-full bg-zinc-950/20 border border-zinc-800/50 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 text-zinc-400 font-bold text-sm sm:text-base select-none">
                      {user?.email}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-red-950/10 border border-red-900/20 hover:bg-red-900/20 text-red-500 font-black py-5 px-6 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs sm:text-sm tracking-widest italic"
                  >
                    <LogOut className="w-5 h-5" /> Cerrar Sesión Segura
                  </button>
                </div>
              </div>

              {/* Botón Guardar Flotante en Mobile / Fijo en Desktop */}
              <div className="flex justify-end pt-4 sm:pt-8 sticky bottom-4 sm:relative z-40">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full md:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-black font-black text-lg sm:text-xl rounded-xl sm:rounded-2xl transition-all shadow-2xl shadow-amber-900/40 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter"
                >
                  {saving && <Loader2 className="w-6 h-6 animate-spin" />}
                  {saving ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL'}
                </button>
              </div>
            </form>
          </div>
        )}
          </>
        )}
      </main>
      {/* Modal de Cobro */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-4 bg-emerald-600/10 rounded-full mb-6 text-emerald-500">
                <DollarSign className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Finalizar y Cobrar</h2>
              <p className="text-zinc-500 mt-2 font-medium italic">Ingresa el monto del servicio para tu registro.</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500 group-focus-within:text-emerald-400 transition-colors">$</span>
                <input 
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0.00"
                  value={checkoutPrice}
                  onChange={(e) => setCheckoutPrice(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-white outline-none transition-all placeholder:text-zinc-800"
                />
              </div>

              <div className="grid gap-3">
                <button 
                  onClick={() => confirmCheckout(false)}
                  disabled={saving || !checkoutPrice}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-black font-black text-xl rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-tighter"
                >
                  {saving ? 'PROCESANDO...' : 'CONFIRMAR Y GUARDAR'}
                </button>
                <button 
                  onClick={() => confirmCheckout(true)}
                  disabled={saving}
                  className="w-full py-4 text-zinc-500 hover:text-white font-black text-sm uppercase tracking-widest transition-colors"
                >
                  OMITIR MONTO
                </button>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full py-2 text-zinc-700 hover:text-zinc-500 font-bold text-xs uppercase tracking-widest transition-colors mt-2"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


        {/* Modal del Cropper Pro */}
        {showCropper && tempImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Ajustar Logo</h2>
                  <p className="text-zinc-500 text-xs font-medium italic">Centrá y hacé zoom para el encuadre perfecto</p>
                </div>
                <button onClick={() => setShowCropper(false)} className="p-3 hover:bg-zinc-800 rounded-full transition-all text-zinc-500"><LogOut className="w-5 h-5 rotate-180" /></button>
              </div>

              <div className="flex-1 relative bg-black/50">
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-8 space-y-8 bg-zinc-900">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                    <span>Nivel de Zoom</span>
                    <span className="text-amber-500">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCropper(false)}
                    className="flex-1 py-5 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCrop}
                    disabled={saving}
                    className="flex-[2] py-5 rounded-2xl bg-amber-600 text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Confirmar Recorte</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Compartir Premium */}
        {showShareModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900/90 border border-white/10 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
              <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Compartir Agenda</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-all"><LogOut className="w-5 h-5 rotate-180" /></button>
              </div>

              <div className="p-8 pt-4 space-y-4">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6 italic leading-relaxed text-center">Elegí el medio para invitar a tus clientes</p>
                
                <button 
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white Fill-white" />
                  </div>
                  <div>
                    <span className="block text-white font-bold uppercase tracking-tight text-sm">WhatsApp</span>
                    <span className="block text-[#25D366] text-[10px] font-bold uppercase tracking-widest opacity-80">Enviar mensaje pro</span>
                  </div>
                </button>

                <button 
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform">
                    <Copy className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <span className="block text-white font-bold uppercase tracking-tight text-sm">Copiar Link</span>
                    <span className="block text-amber-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Link de reserva online</span>
                  </div>
                </button>

                <div className="pt-6 flex flex-col items-center gap-4 border-t border-white/5">
                  <button 
                    onClick={handleShareNative}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Otras opciones del sistema
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
