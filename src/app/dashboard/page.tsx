'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCroppedImg } from '@/lib/imageUtils'
import { toast } from 'sonner'
import { Area } from 'react-easy-crop'
import { 
  Turno, 
  ConfiguracionBarberia, 
  HorarioRutina, 
  HorarioEspecifico, 
  FinanzasData, 
  DashboardTab,
  Cliente,
  Producto,
  CategoriaProducto,
  VentaProducto
} from '@/types/dashboard'
import { User } from '@supabase/supabase-js'
import { Scissors } from 'lucide-react'

// Components
import Sidebar from '@/components/dashboard/Sidebar'
import AgendaTab from '@/components/dashboard/tabs/AgendaTab'
import ProgramarTab from '@/components/dashboard/tabs/ProgramarTab'
import FinanzasTab from '@/components/dashboard/tabs/FinanzasTab'
import ClientesTab from '@/components/dashboard/tabs/ClientesTab'
import CatalogoTab from '@/components/dashboard/tabs/CatalogoTab'
import ConfigTab from '@/components/dashboard/tabs/ConfigTab'

// Modals
import CheckoutModal from '@/components/dashboard/modals/CheckoutModal'
import ShareModal from '@/components/dashboard/modals/ShareModal'
import CropperModal from '@/components/dashboard/modals/CropperModal'
import ManualTurnoModal from '@/components/dashboard/modals/ManualTurnoModal'
import RegisterClientModal from '@/components/dashboard/modals/RegisterClientModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { GlobalFooter } from '@/components/layout/GlobalFooter'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('agenda')
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [fetchingTurns, setFetchingTurns] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [config, setConfig] = useState<ConfiguracionBarberia | null>(null)
  const [turns, setTurns] = useState<Turno[]>([])
  const [allUpcomingTurns, setAllUpcomingTurns] = useState<Turno[]>([])
  const [clients, setClients] = useState<Cliente[]>([])
  const [products, setProducts] = useState<Producto[]>([])
  const [categories, setCategories] = useState<CategoriaProducto[]>([])
  const [vipPhones, setVipPhones] = useState<Set<string>>(new Set())
  
  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [clientToRegister, setClientToRegister] = useState({ nombre: '', telefono: '' })

  const [viewDate, setViewDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
  })
  
  // Finances states
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null)
  const [checkoutPrice, setCheckoutPrice] = useState('')
  const [financesDate, setFinancesDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  })
  const [financesMonth, setFinancesMonth] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit' }).format(new Date())
  })
  const [historyFilterMode, setHistoryFilterMode] = useState<'day' | 'month'>('day')
  const [financesData, setFinancesData] = useState<FinanzasData>({
    dailyTotal: 0,
    dailyCashTotal: 0,
    dailyTransferTotal: 0,
    monthlyTotal: 0,
    annualTotal: 0,
    history: []
  })
  
  // Schedule states
  const [planningSchedule, setPlanningSchedule] = useState<HorarioEspecifico[]>([])
  
  // Config states
  const [editNombre, setEditNombre] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editMaps, setEditMaps] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null)
  
  // Fidelización states
  const [editFidelizacionActiva, setEditFidelizacionActiva] = useState(false)
  const [editThreshold, setEditThreshold] = useState(10)
  const [editVipActivo, setEditVipActivo] = useState(false)
  
  // Cropper states
  const [tempImage, setTempImage] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      // Prioridad máxima: Restaurar estado de pestaña antes que cualquier otra cosa
      const savedTab = localStorage.getItem('activeDashboardTab')
      if (savedTab) {
        setActiveTab(savedTab as DashboardTab)
      }

      try {
        setCheckingAuth(true)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/admin/auth')
          setLoading(false)
        } else {
          setUser(authUser)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setLoading(false)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkUser()
    
    // Restaurar Configuración (Instant Look)
    const cachedConfig = localStorage.getItem('barberia_config_cache')
    if (cachedConfig) {
      try {
        const parsed = JSON.parse(cachedConfig)
        setConfig(parsed)
        setEditNombre(parsed.nombre_barberia)
        setEditSlug(parsed.slug || '')
        setEditPhone(parsed.telefono_barbero.replace('+54', ''))
        setEditMaps(parsed.google_maps_link || '')
        setEditLogoUrl(parsed.logo_url || null)
        setEditFidelizacionActiva(parsed.fidelizacion_activa || false)
        setEditThreshold(parsed.fidelizacion_threshold || 10)
        setEditVipActivo(parsed.vip_activo || false)
      } catch (e) { console.error('Cache parse error:', e) }
    }

    // Fix Scroll Glitch
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [router])

  // Persistir pestaña activa
  useEffect(() => {
    localStorage.setItem('activeDashboardTab', activeTab)
  }, [activeTab])

  const fetchVipStatus = useCallback(async (userId: string) => {
    if (!config?.vip_activo) {
      setVipPhones(new Set())
      return
    }

    const now = new Date()
    const firstDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(now.getFullYear(), now.getMonth(), 1))
    
    // Consultamos turnos completados del mes para identificar VIPs (>= 3 cortes)
    const { data } = await supabase
      .from('turnos')
      .select('cliente_telefono')
      .eq('barbero_id', userId)
      .eq('estado', 'completado')
      .gte('fecha', firstDay)

    if (data) {
      const counts: Record<string, number> = {}
      data.forEach(t => {
        if (t.cliente_telefono !== 'MANUAL') {
          counts[t.cliente_telefono] = (counts[t.cliente_telefono] || 0) + 1
        }
      })
      const vips = new Set(Object.keys(counts).filter(phone => counts[phone] >= 3))
      setVipPhones(vips)
    }
  }, [config?.vip_activo])

  const fetchFinances = useCallback(async (userId: string) => {
    const firstDayOfMonth = financesMonth + '-01'
    const dateObj = new Date(financesMonth + '-01T12:00:00')
    const lastDayOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).toISOString().split('T')[0]
    const firstDayOfYear = new Date().getFullYear() + '-01-01'

    const { data: dailyData } = await supabase.from('turnos').select('precio, metodo_pago').eq('barbero_id', userId).eq('estado', 'completado').eq('fecha', financesDate)
    const { data: monthlyData } = await supabase.from('turnos').select('precio').eq('barbero_id', userId).eq('estado', 'completado').gte('fecha', firstDayOfMonth).lte('fecha', lastDayOfMonth)
     const { data: annualData } = await supabase.from('turnos').select('precio').eq('barbero_id', userId).eq('estado', 'completado').gte('fecha', firstDayOfYear)
 
     const historyQuery = supabase.from('turnos').select('*').eq('barbero_id', userId).eq('estado', 'completado')
     if (historyFilterMode === 'day') {
       historyQuery.eq('fecha', financesDate).order('hora', { ascending: true })
     } else {
       historyQuery.gte('fecha', firstDayOfMonth).lte('fecha', lastDayOfMonth).order('fecha', { ascending: false }).order('hora', { ascending: false })
     }
 
     const { data: historyData } = await historyQuery.limit(50)

     // NUEVO: Consultar Ventas de Productos
     const { data: salesDaily } = await supabase.from('ventas_productos').select('precio, metodo_pago').eq('user_id', userId).eq('fecha', financesDate)
     const { data: salesMonthly } = await supabase.from('ventas_productos').select('precio').eq('user_id', userId).gte('fecha', firstDayOfMonth).lte('fecha', lastDayOfMonth)
     const { data: salesAnnual } = await supabase.from('ventas_productos').select('precio').eq('user_id', userId).gte('fecha', firstDayOfYear)
     const { data: salesHistory } = await supabase.from('ventas_productos').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)

     const totalDailyTurns = dailyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     const totalDailySales = salesDaily?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     
     const cashDailyTurns = dailyData?.filter(t => t.metodo_pago === 'efectivo').reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     const cashDailySales = salesDaily?.filter(s => s.metodo_pago === 'efectivo').reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     
     const transDailyTurns = dailyData?.filter(t => t.metodo_pago === 'transferencia').reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     const transDailySales = salesDaily?.filter(s => s.metodo_pago === 'transferencia').reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0

     const totalMonthlyTurns = monthlyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     const totalMonthlySales = salesMonthly?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0

     const totalAnnualTurns = annualData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0
     const totalAnnualSales = salesAnnual?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0

     // Combinar turnos y ventas en el historial, ordenados por tiempo
     const combinedHistory: (Turno | VentaProducto)[] = [
       ...((historyData as Turno[]) || []).map(t => ({ ...t, isSale: false })),
       ...((salesHistory as VentaProducto[]) || []).map(s => ({ 
          ...s, 
          isSale: true, 
          hora: s.created_at ? new Date(s.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00'
       }))
     ].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
     })

     setFinancesData({
       dailyTotal: totalDailyTurns + totalDailySales,
       dailyCashTotal: cashDailyTurns + cashDailySales,
       dailyTransferTotal: transDailyTurns + transDailySales,
       monthlyTotal: totalMonthlyTurns + totalMonthlySales,
       annualTotal: totalAnnualTurns + totalAnnualSales,
       history: combinedHistory.slice(0, 50)
     })
   }, [financesDate, financesMonth, historyFilterMode])

  const fetchClients = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_barbero', userId)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      setClients((data as Cliente[]) || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }, [])

  const fetchCatalogo = useCallback(async (userId: string) => {
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('productos').select('*').eq('user_id', userId).order('nombre', { ascending: true }),
        supabase.from('categorias_productos').select('*').eq('user_id', userId).order('nombre', { ascending: true })
      ])
      
      setProducts((pRes.data as Producto[]) || [])
      setCategories((cRes.data as CategoriaProducto[]) || [])
    } catch (error) {
      console.error('Error fetching catalog:', error)
    }
  }, [])

  const fetchTurnsForDate = useCallback(async (userId: string, targetDate: string) => {
    setFetchingTurns(true)
    try {
      const { data: turnsData } = await supabase
        .from('turnos')
        .select('*')
        .eq('barbero_id', userId)
        .eq('fecha', targetDate)
        .eq('estado', 'pendiente')
        .order('hora', { ascending: true })
      
      setTurns((turnsData as Turno[]) || [])
    } catch (error) {
      console.error('Error fetching turns:', error)
    } finally {
      setFetchingTurns(false)
    }
  }, [])

  const fetchData = useCallback(async (userId: string) => {
    if (!config) setLoading(true)
    try {
      // 1. Preparar fechas para planificación
      const today = new Date()
      const next7Days: string[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i)
        next7Days.push(d.toLocaleDateString('en-CA'))
      }

      // 2. Disparar consultas en paralelo
      const [configRes, scheduleRes, exceptionsRes, upcomingTurnsRes] = await Promise.all([
        supabase.from('configuracion_barberia').select('*').eq('user_id', userId).single(),
        supabase.from('horarios_barberia').select('*').eq('user_id', userId).order('dia_semana', { ascending: true }),
        supabase.from('horarios_especificos').select('*').eq('user_id', userId).in('fecha', next7Days),
        supabase.from('turnos').select('*').eq('barbero_id', userId).in('fecha', next7Days).eq('estado', 'pendiente')
      ])

      const configData = configRes.data
      const scheduleData = scheduleRes.data
      const exceptionsData = exceptionsRes.data
      const upcomingTurnsData = upcomingTurnsRes.data

      if (configData) {
        setConfig(configData)
        localStorage.setItem('barberia_config_cache', JSON.stringify(configData))
        setEditNombre(configData.nombre_barberia)
        setEditSlug(configData.slug || '')
        setEditPhone(configData.telefono_barbero.replace('+54', ''))
        setEditMaps(configData.google_maps_link || '')
        setEditLogoUrl(configData.logo_url || null)
        setEditFidelizacionActiva(configData.fidelizacion_activa || false)
        setEditThreshold(configData.fidelizacion_threshold || 10)
        setEditVipActivo(configData.vip_activo || false)

        // Procesar planificación semanal
        const finalPlanning: HorarioEspecifico[] = next7Days.map(fechaStr => {
           const specific = exceptionsData?.find(e => e.fecha === fechaStr)
           if (specific) return { ...specific, isNew: false }
           const dObj = new Date(fechaStr + 'T12:00:00')
           const routine = (scheduleData || []).find(r => r.dia_semana === dObj.getDay())
           return { fecha: fechaStr, user_id: userId, activo: false, slots: routine?.slots || [], isNew: true }
        })
        setPlanningSchedule(finalPlanning)
        setAllUpcomingTurns((upcomingTurnsData as Turno[]) || [])
      } else {
        router.push('/dashboard/onboarding')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al sincronizar datos. Intente recargar.')
    } finally {
      // SOLO liberamos el cargador si config ya existe (ya sea de cache o de red)
      // Pero para Atomic Loading real, esperamos un leve delay para asegurar render estable
      setTimeout(() => setLoading(false), 300)
      window.scrollTo(0, 0)
    }
  }, [router])

  // Efecto para cambios de fecha (optimizado: solo carga turnos)
  useEffect(() => {
    if (user?.id) {
      fetchTurnsForDate(user.id, viewDate)
    }
  }, [viewDate, user?.id, fetchTurnsForDate])

  // Efecto inicial: Carga datos estructurales una sola vez al montar o cambiar de usuario
  useEffect(() => {
    if (user?.id) {
      fetchData(user.id)
      fetchClients(user.id)
      fetchCatalogo(user.id)
    }
  }, [user?.id, fetchData, fetchClients, fetchCatalogo])

  // Efecto Finanzas: Se dispara solo cuando cambian los filtros de finanzas
  useEffect(() => {
    if (user?.id) {
      fetchFinances(user.id)
    }
  }, [user?.id, fetchFinances])

  // Efecto VIP: Se dispara cuando la configuración está lista
  useEffect(() => {
    if (user?.id && config) {
      fetchVipStatus(user.id)
    }
  }, [user?.id, config, fetchVipStatus])

  // REALTIME PARA EL BARBERO: Suscripción a nuevos turnos
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('realtime_turns_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turnos',
          filter: `barbero_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime payload:', payload)
          // Si algo cambia en los turnos del barbero, refrescamos la lista del día seleccionado y finanzas
          fetchTurnsForDate(user.id, viewDate)
          fetchFinances(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, viewDate, fetchTurnsForDate, fetchFinances])

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('configuracion_barberia').update({
      nombre_barberia: editNombre, 
      slug: editSlug, 
      telefono_barbero: `+54${editPhone}`, 
      google_maps_link: editMaps, 
      logo_url: editLogoUrl,
      fidelizacion_activa: editFidelizacionActiva,
      fidelizacion_threshold: editThreshold,
      vip_activo: editVipActivo
    }).eq('user_id', user?.id)

    if (error) {
      toast.error(`Error: ${error.message}`)
    } else {
      await fetchData(user?.id || '')
      toast.success('Perfil actualizado')
      setActiveTab('agenda')
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

  const handleSaveCrop = async (croppedAreaPixels: Area) => {
    if (!tempImage || !user) return
    setSaving(true)
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      if (!croppedImage) throw new Error('Error al procesar el recorte')
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage.from('barberia_logos').upload(fileName, croppedImage)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('barberia_logos').getPublicUrl(fileName)
      const { error: dbError } = await supabase.from('configuracion_barberia').update({ logo_url: publicUrl }).eq('user_id', user.id)
      if (dbError) throw dbError
      await fetchData(user.id)
      setShowCropper(false)
      setTempImage(null)
      toast.success('📸 Logo guardado')
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePlanning = async () => {
    if (!user) return
    setSaving(true)
    
    // ORDENAMIENTO FINAL antes de guardar (Vista prolija al final)
    const sortedSchedule = planningSchedule.map(dia => ({
      ...dia,
      slots: [...(dia.slots || [])].sort()
    }))

    try {
      const { error } = await supabase.from('horarios_especificos').upsert(
        sortedSchedule.map(s => ({ user_id: user.id, fecha: s.fecha, activo: s.activo, slots: s.slots || [] })),
        { onConflict: 'user_id,fecha' }
      )
      if (error) throw error
      toast.success('✅ Agenda Semanal confirmada')
      fetchData(user.id)
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRegisterClient = async (nombre: string, telefono: string) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('clientes').insert([{
        id_barbero: user.id,
        nombre: nombre.toUpperCase(),
        telefono
      }])
      if (error) throw error
      toast.success('👤 Cliente registrado con éxito')
      setShowRegisterModal(false)
      fetchClients(user.id)
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const openRegisterModal = (nombre: string, telefono: string) => {
    setClientToRegister({ nombre, telefono })
    setShowRegisterModal(true)
  }

  const updateClientStats = async (nombre: string, telefono: string) => {
    if (!user || telefono === 'MANUAL') return
    try {
      const { data: existing } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_barbero', user.id)
        .eq('telefono', telefono)
        .single()
      
      if (existing) {
        await supabase.from('clientes').update({
          total_cortes: (existing.total_cortes || 0) + 1,
          ultima_visita: new Date().toISOString()
        }).eq('id', existing.id)
        fetchClients(user.id)
      }
    } catch (e) { console.error('Error updating client stats:', e) }
  }

  const confirmCheckout = async (omitValue: boolean = false, method: 'efectivo' | 'transferencia' | null = null, desc: string = '') => {
    if (!selectedTurnId || !user) return
    setSaving(true)
    const finalPrice = omitValue ? 0 : Number(checkoutPrice)
    const { error } = await supabase.from('turnos').update({ 
      estado: 'completado', 
      precio: finalPrice,
      metodo_pago: method,
      descripcion_servicio: desc
    }).eq('id', selectedTurnId).eq('barbero_id', user.id)
    if (!error) {
      const finishedTurn = turns.find(t => t.id === selectedTurnId)
      if (finishedTurn) {
        await updateClientStats(finishedTurn.cliente_nombre, finishedTurn.cliente_telefono)
      }
      setTurns(prev => prev.filter(t => t.id !== selectedTurnId))
      setShowCheckoutModal(false)
      fetchFinances(user.id)
      toast.success('✅ Turno cobrado')
    } else {
      toast.error(`Error: ${error.message}`)
    }
    setSaving(false)
  }

  const handleDeleteTurn = async (id: string) => {
    if (!user) return
    if (window.confirm('¿Estás seguro de que deseas eliminar este turno y liberar el horario para otro cliente?')) {
      const { error } = await supabase.from('turnos').delete().eq('id', id).eq('barbero_id', user.id)
      if (!error) {
        setTurns(prev => prev.filter(t => t.id !== id))
        toast.success('Turno eliminado correctamente')
      } else {
        toast.error(`Error al eliminar: ${error.message}`)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/auth')
    toast.success('Sesión cerrada')
  }
  
  const handleCreateManualTurn = async (data: { nombre: string; servicio: string; precio: number; hora: string }) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('turnos').insert([{
        barbero_id: user.id,
        cliente_nombre: data.nombre.toUpperCase(),
        cliente_telefono: 'MANUAL', 
        fecha: viewDate,
        hora: data.hora,
        precio: data.precio,
        servicio: data.servicio,
        estado: 'completado',
        es_manual: true
      }])

      if (error) throw error
      
      await updateClientStats(data.nombre, 'MANUAL')

      toast.success('✅ Turno manual registrado')
      setShowManualModal(false)
      
      // Atomic Refresh
      await Promise.all([
        fetchData(user.id),
        fetchFinances(user.id),
        fetchTurnsForDate(user.id, viewDate)
      ])
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
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
    toast.success('✅ Link copiado')
    setShowShareModal(false)
  }

  const handleRecordProductSale = async (nombre: string, precio: number, metodo: 'efectivo' | 'transferencia') => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('ventas_productos').insert([{
        user_id: user.id,
        nombre_producto: nombre.toUpperCase(),
        precio,
        metodo_pago: metodo,
        fecha: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())
      }])
      if (error) throw error
      toast.success('🛍️ Venta registrada correctamente')
      fetchFinances(user.id)
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleShareNative = async () => {
    const shareUrl = `${window.location.origin}/reserva/${config?.slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: config?.nombre_barberia, text: `¡Hola! 💈 Reservá tu turno online aquí: ${shareUrl}` })
      } catch (err) { console.log(err) }
    } else {
      handleCopyLink()
    }
    setShowShareModal(false)
  }

  useEffect(() => {
    if (config?.nombre_barberia) document.title = `${config.nombre_barberia.toUpperCase()} | PANEL`
  }, [config?.nombre_barberia])

  // ==========================================
  // ATOMIC LOADING MASK (Pure Black for Speed)
  // ==========================================
  if (loading) {
    return <div className="fixed inset-0 bg-[#050505] z-[9999]" />
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden bg-[#050505] text-zinc-100 font-sans max-w-full overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isMobileSidebarOpen={isMobileSidebarOpen} setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        config={config} userEmail={user?.email} setShowLogoutModal={setShowLogoutModal}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-12 w-full lg:w-auto relative min-h-[100dvh] lg:h-screen overflow-y-auto max-w-full overflow-x-hidden custom-scrollbar pb-32">
        {/* BRANDING LIBERADO (SIN CAJAS, SIN FONDOS) */}
        {config && (
          <div className="flex lg:hidden flex-row items-center justify-center gap-4 w-full mb-10 bg-transparent border-none p-0 shadow-none">
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center overflow-hidden relative p-0 bg-transparent">
              {config.logo_url ? (
                <img 
                  src={config.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-2xl"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-2xl">
                  <Scissors className="w-6 h-6 text-zinc-800" />
                </div>
              )}
            </div>
            <span className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
              {config.nombre_barberia}
            </span>
          </div>
        )}

        <>
          {activeTab === 'agenda' && (
            <AgendaTab 
              turns={turns} viewDate={viewDate} setViewDate={setViewDate}
              onFinishTurn={(id) => { setSelectedTurnId(id); setShowCheckoutModal(true); }}
              onDeleteTurn={handleDeleteTurn}
              config={config} onShare={() => setShowShareModal(true)}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              onAddManualTurn={() => setShowManualModal(true)}
              fetchingTurns={fetchingTurns}
              clients={clients}
              vipPhones={vipPhones}
              onRegisterClient={openRegisterModal}
              planningSchedule={planningSchedule}
            />
          )}
          {activeTab === 'programar' && (
            <ProgramarTab 
              planningSchedule={planningSchedule} setPlanningSchedule={setPlanningSchedule}
              onUpdatePlanning={handleUpdatePlanning}
              copyRoutineToPlanning={async (idx) => {
                  const { data: scheduleData } = await supabase.from('horarios_barberia').select('*').eq('user_id', user?.id).order('dia_semana', { ascending: true })
                  const dayObj = new Date(planningSchedule[idx].fecha + 'T12:00:00')
                  const routine = (scheduleData || []).find(r => r.dia_semana === dayObj.getDay())
                  if (routine) {
                    setPlanningSchedule(prev => prev.map((dia, i) => {
                      if (i !== idx) return dia
                      return { ...dia, slots: [...(routine.slots || [])].sort(), activo: true }
                    }))
                    toast.success('✅ Rutina cargada')
                  } else {
                    toast.error('❌ No hay plantilla para este día')
                  }
              }}
              addPlanningSlot={(idx) => {
                setPlanningSchedule(prev => prev.map((dia, i) => {
                  if (i !== idx) return dia;
                  const daySlots = [...(dia.slots || [])];
                  let nextTime = "09:00";
                  if (daySlots.length > 0) {
                    const last = daySlots[daySlots.length - 1];
                    const [h, m] = last.split(':').map(Number);
                    nextTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                  }
                  return { ...dia, slots: [...daySlots, nextTime].sort(), activo: true };
                }));
              }}
              removePlanningSlot={(dayIdx, slotIdx) => {
                setPlanningSchedule(prev => prev.map((dia, i) => {
                  if (i !== dayIdx) return dia;
                  return { ...dia, slots: dia.slots.filter((_, si) => si !== slotIdx) };
                }));
              }}
              updatePlanningSlot={(dayIdx, slotIdx, newValue) => {
                setPlanningSchedule(prev => prev.map((dia, i) => {
                  if (i !== dayIdx) return dia;
                  const newSlots = [...dia.slots];
                  newSlots[slotIdx] = newValue;
                  return { ...dia, slots: newSlots };
                }));
              }}
              saving={saving} config={config} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              upcomingTurns={allUpcomingTurns}
            />
          )}
          {activeTab === 'finanzas' && (
            <FinanzasTab 
              financesData={financesData} financesDate={financesDate} setFinancesDate={setFinancesDate}
              financesMonth={financesMonth} setFinancesMonth={setFinancesMonth}
              historyFilterMode={historyFilterMode} setHistoryFilterMode={setHistoryFilterMode}
              config={config} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              products={products}
              onRecordSale={handleRecordProductSale}
              saving={saving}
            />
          )}
          {activeTab === 'clientes' && (
            <ClientesTab 
              clientes={clients}
              config={config}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            />
          )}
          {activeTab === 'catalogo' && (
            <CatalogoTab 
              config={config} 
              products={products} 
              categories={categories}
              onRefresh={() => user && fetchCatalogo(user.id)}
              onToggleActive={async (val) => {
                if (!user) return
                const { error } = await supabase.from('configuracion_barberia').update({ catalogo_activo: val }).eq('user_id', user.id)
                if (!error) {
                  setConfig(prev => prev ? { ...prev, catalogo_activo: val } : null)
                  toast.success(val ? '🚀 Catálogo activado' : '🔴 Catálogo desactivado')
                }
              }}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              userId={user?.id}
            />
          )}
          {activeTab === 'config' && (
            <ConfigTab 
              editNombre={editNombre} setEditNombre={setEditNombre}
              editSlug={editSlug} setEditSlug={setEditSlug}
              editPhone={editPhone} setEditPhone={setEditPhone}
              editMaps={editMaps} setEditMaps={setEditMaps}
              editLogoUrl={editLogoUrl} setEditLogoUrl={setEditLogoUrl}
              editFidelizacionActiva={editFidelizacionActiva} setEditFidelizacionActiva={setEditFidelizacionActiva}
              editThreshold={editThreshold} setEditThreshold={setEditThreshold}
              editVipActivo={editVipActivo} setEditVipActivo={setEditVipActivo}
              onUpdateConfig={handleUpdateConfig} onLogoUpload={handleLogoUpload}
              config={config} userEmail={user?.email} onLogout={() => setShowLogoutModal(true)}
              onShare={() => setShowShareModal(true)} saving={saving} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            />
          )}
        </>
        
        <GlobalFooter />
      </main>

      <CheckoutModal 
        isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)}
        onConfirm={confirmCheckout} price={checkoutPrice} setPrice={setCheckoutPrice} saving={saving}
      />

      <ShareModal 
        isOpen={showShareModal} onClose={() => setShowShareModal(false)}
        onShareWhatsApp={handleShareWhatsApp} onCopyLink={handleCopyLink} onShareNative={handleShareNative}
      />

      <CropperModal 
        isOpen={showCropper} image={tempImage || ''} onClose={() => setShowCropper(false)}
        onSave={handleSaveCrop} saving={saving}
      />
      
      <ManualTurnoModal 
        isOpen={showManualModal} onClose={() => setShowManualModal(false)}
        onConfirm={handleCreateManualTurn} saving={saving}
      />

      <ConfirmModal 
        isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout}
        title="¿Cerrar Sesión?" description="Tendrás que volver a ingresar para gestionar tus turnos."
        confirmText="Cerrar Sesión" cancelText="Cancelar" type="info"
      />

      <RegisterClientModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onConfirm={handleRegisterClient}
        initialName={clientToRegister.nombre}
        initialPhone={clientToRegister.telefono}
        saving={saving}
      />
    </div>
  )
}
