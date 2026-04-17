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
  DashboardTab 
} from '@/types/dashboard'
import { User } from '@supabase/supabase-js'

// Components
import Sidebar from '@/components/dashboard/Sidebar'
import AgendaTab from '@/components/dashboard/tabs/AgendaTab'
import ProgramarTab from '@/components/dashboard/tabs/ProgramarTab'
import FinanzasTab from '@/components/dashboard/tabs/FinanzasTab'
import ConfigTab from '@/components/dashboard/tabs/ConfigTab'

// Modals
import CheckoutModal from '@/components/dashboard/modals/CheckoutModal'
import ShareModal from '@/components/dashboard/modals/ShareModal'
import CropperModal from '@/components/dashboard/modals/CropperModal'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('agenda')
  const [loading, setLoading] = useState(true)
  const [fetchingTurns, setFetchingTurns] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [config, setConfig] = useState<ConfiguracionBarberia | null>(null)
  const [turns, setTurns] = useState<Turno[]>([])
  
  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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
    monthlyTotal: 0,
    annualTotal: 0,
    history: []
  })
  
  // Schedule states
  const [planningSchedule, setPlanningSchedule] = useState<HorarioEspecifico[]>([])
  
  // Config states
  const [editNombre, setEditNombre] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editMaps, setEditMaps] = useState('')
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null)
  
  // Cropper states
  const [tempImage, setTempImage] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/admin/auth')
        return
      }
      setUser(authUser)
    }
    checkUser()
  }, [router])

  const fetchFinances = useCallback(async (userId: string) => {
    const firstDayOfMonth = financesMonth + '-01'
    const dateObj = new Date(financesMonth + '-01T12:00:00')
    const lastDayOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).toISOString().split('T')[0]
    const firstDayOfYear = new Date().getFullYear() + '-01-01'

    const { data: dailyData } = await supabase.from('turnos').select('precio').eq('barbero_id', userId).eq('estado', 'completado').eq('fecha', financesDate)
    const { data: monthlyData } = await supabase.from('turnos').select('precio').eq('barbero_id', userId).eq('estado', 'completado').gte('fecha', firstDayOfMonth).lte('fecha', lastDayOfMonth)
    const { data: annualData } = await supabase.from('turnos').select('precio').eq('barbero_id', userId).eq('estado', 'completado').gte('fecha', firstDayOfYear)

    const historyQuery = supabase.from('turnos').select('*').eq('barbero_id', userId).eq('estado', 'completado')
    if (historyFilterMode === 'day') {
      historyQuery.eq('fecha', financesDate).order('hora', { ascending: true })
    } else {
      historyQuery.gte('fecha', firstDayOfMonth).lte('fecha', lastDayOfMonth).order('fecha', { ascending: false }).order('hora', { ascending: false })
    }

    const { data: historyData } = await historyQuery.limit(50)

    setFinancesData({
      dailyTotal: dailyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0,
      monthlyTotal: monthlyData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0,
      annualTotal: annualData?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0,
      history: (historyData as Turno[]) || []
    })
  }, [financesDate, financesMonth, historyFilterMode])

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
      // 1. Configuración básica
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

        // 2. Horarios base (solo para planificación, ya no se editan aquí como rutina maestra activa)
        const { data: scheduleData } = await supabase
          .from('horarios_barberia')
          .select('*')
          .eq('user_id', userId)
          .order('dia_semana', { ascending: true })

        // 3. Planificación de los próximos 7 días
        const today = new Date()
        const next7Days: string[] = []
        for (let i = 0; i < 7; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          next7Days.push(d.toLocaleDateString('en-CA'))
        }

        const { data: exceptionsData } = await supabase.from('horarios_especificos').select('*').eq('user_id', userId).in('fecha', next7Days)
        const finalPlanning: HorarioEspecifico[] = next7Days.map(fechaStr => {
           const specific = exceptionsData?.find(e => e.fecha === fechaStr)
           if (specific) return { ...specific, isNew: false }
           const dObj = new Date(fechaStr + 'T12:00:00')
           const routine = (scheduleData || []).find(r => r.dia_semana === dObj.getDay())
           return { fecha: fechaStr, user_id: userId, activo: false, slots: routine?.slots || [], isNew: true }
        })
        setPlanningSchedule(finalPlanning)
      } else {
        router.push('/dashboard/onboarding')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [config, router])

  // Efecto para cambios de fecha (optimizado: solo carga turnos)
  useEffect(() => {
    if (user?.id) {
      fetchTurnsForDate(user.id, viewDate)
    }
  }, [viewDate, user?.id, fetchTurnsForDate])

  // Efecto inicial y finanzas
  useEffect(() => {
    if (user?.id) {
      fetchData(user.id)
      fetchFinances(user.id)
    }
  }, [user?.id, fetchData, fetchFinances])

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const newSlug = editNombre.toLowerCase().trim().replace(/\s+/g, '-')
    const { error } = await supabase.from('configuracion_barberia').update({
      nombre_barberia: editNombre, slug: newSlug, telefono_barbero: `+54${editPhone}`, google_maps_link: editMaps, logo_url: editLogoUrl
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

  /* handleUpdateMasterRoutine eliminada por pedido usuario */

  const handleUpdatePlanning = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('horarios_especificos').upsert(
        planningSchedule.map(s => ({ user_id: user.id, fecha: s.fecha, activo: s.activo, slots: s.slots || [] })),
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

  const confirmCheckout = async (omitValue: boolean = false) => {
    if (!selectedTurnId || !user) return
    setSaving(true)
    const finalPrice = omitValue ? 0 : Number(checkoutPrice)
    const { error } = await supabase.from('turnos').update({ estado: 'completado', precio: finalPrice }).eq('id', selectedTurnId).eq('barbero_id', user.id)
    if (!error) {
      setTurns(prev => prev.filter(t => t.id !== selectedTurnId))
      setShowCheckoutModal(false)
      fetchFinances(user.id)
      toast.success('✅ Turno cobrado')
    } else {
      toast.error(`Error: ${error.message}`)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/auth')
    toast.success('Sesión cerrada')
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

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex pb-12 font-sans overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isMobileSidebarOpen={isMobileSidebarOpen} setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        config={config} userEmail={user?.email} setShowLogoutModal={setShowLogoutModal}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-12 w-full lg:w-auto relative min-h-screen">
        {loading && !config ? (
          <div className="animate-in fade-in duration-500 space-y-12">
             <div className="h-12 w-64 md:w-96 bg-zinc-800/50 animate-pulse rounded-2xl" />
             <div className="h-96 w-full bg-zinc-800/50 animate-pulse rounded-[2rem]" />
          </div>
        ) : (
          <>
            {activeTab === 'agenda' && (
              <AgendaTab 
                turns={turns} viewDate={viewDate} setViewDate={setViewDate}
                onFinishTurn={(id) => { setSelectedTurnId(id); setShowCheckoutModal(true); }}
                config={config} onShare={() => setShowShareModal(true)}
                onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                fetchingTurns={fetchingTurns}
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
                     const newSched = [...planningSchedule]; newSched[idx].slots = [...(routine.slots || [])]; newSched[idx].activo = true; setPlanningSchedule(newSched)
                   }
                }}
                addPlanningSlot={(idx) => {
                  const newSched = [...planningSchedule]; const daySlots = [...(newSched[idx].slots || [])]
                  let nextTime = "09:00"
                  if (daySlots.length > 0) {
                    const last = daySlots[daySlots.length - 1]; const [h, m] = last.split(':').map(Number)
                    nextTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                  }
                  newSched[idx].slots = [...daySlots, nextTime]; setPlanningSchedule(newSched)
                }}
                removePlanningSlot={(dayIdx, slotIdx) => {
                  const newSched = [...planningSchedule]; newSched[dayIdx].slots = newSched[dayIdx].slots.filter((_, i) => i !== slotIdx); setPlanningSchedule(newSched)
                }}
                updatePlanningSlot={(dayIdx, slotIdx, newValue) => {
                  const newSched = [...planningSchedule]; newSched[dayIdx].slots[slotIdx] = newValue; setPlanningSchedule(newSched)
                }}
                saving={saving} config={config} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              />
            )}
            {activeTab === 'finanzas' && (
              <FinanzasTab 
                financesData={financesData} financesDate={financesDate} setFinancesDate={setFinancesDate}
                financesMonth={financesMonth} setFinancesMonth={setFinancesMonth}
                historyFilterMode={historyFilterMode} setHistoryFilterMode={setHistoryFilterMode}
                config={config} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              />
            )}
            {activeTab === 'config' && (
              <ConfigTab 
                editNombre={editNombre} setEditNombre={setEditNombre}
                editPhone={editPhone} setEditPhone={setEditPhone}
                editMaps={editMaps} setEditMaps={setEditMaps}
                editLogoUrl={editLogoUrl} setEditLogoUrl={setEditLogoUrl}
                onUpdateConfig={handleUpdateConfig} onLogoUpload={handleLogoUpload}
                config={config} userEmail={user?.email} onLogout={() => setShowLogoutModal(true)}
                onShare={() => setShowShareModal(true)} saving={saving} onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              />
            )}
          </>
        )}
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

      <ConfirmModal 
        isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout}
        title="¿Cerrar Sesión?" description="Tendrás que volver a ingresar para gestionar tus turnos."
        confirmText="Cerrar Sesión" cancelText="Cancelar" type="info"
      />
    </div>
  )
}
