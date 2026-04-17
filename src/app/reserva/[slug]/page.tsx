import { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import BookingClient from '@/components/reserva/BookingClient'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: barber } = await supabase
    .from('configuracion_barberia')
    .select('nombre_barberia')
    .eq('slug', slug)
    .single()

  if (!barber) {
    return {
      title: 'Barbería No Encontrada | Barberiapp',
      description: 'El link de reserva no es válido o la barbería no existe.'
    }
  }

  const title = `Reserva en ${barber.nombre_barberia} | Barberiapp`
  const description = `¡Dale el look que tu barbería amerita! Reserva online rápido y fácil en ${barber.nombre_barberia}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Barberiapp',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  }
}

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: barber } = await supabase
    .from('configuracion_barberia')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!barber) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-20 h-20 text-amber-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-white mb-4">¡Ups! Barbería No Encontrada</h1>
        <p className="text-zinc-400 max-w-md mb-8">El link que utilizaste no parece ser válido o la barbería ya no está disponible.</p>
        <Link href="/" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Volver al Inicio
        </Link>
      </div>
    )
  }

  return <BookingClient initialBarberConfig={barber} />
}
