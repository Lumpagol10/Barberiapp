import { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import CatalogClient from '@/components/catalogo/CatalogClient'
import { AlertTriangle, ArrowLeft, Store } from 'lucide-react'
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
      title: 'Catálogo No Encontrado | Barberiapp',
    }
  }

  const title = `Catálogo de ${barber.nombre_barberia} | Barberiapp`
  const description = `Explorá los productos exclusivos de ${barber.nombre_barberia}. Ceras, aceites y más.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' }
  }
}

export default async function CatalogPage({ params }: PageProps) {
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
        <h1 className="text-4xl font-black text-white mb-4">Catálogo No Encontrado</h1>
        <p className="text-zinc-400 max-w-md mb-8">El link que utilizaste no parece ser válido o el catálogo ya no está disponible.</p>
        <Link href="/" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Volver al Inicio
        </Link>
      </div>
    )
  }

  if (!barber.catalogo_activo) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
          <Store className="w-20 h-20 text-zinc-800 mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">Vidriera en Preparación</h1>
          <p className="text-zinc-400 max-w-md mb-8">Esta barbería aún no ha publicado su catálogo de productos. ¡Vuelve pronto!</p>
          <Link href={`/reserva/${slug}`} className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-2xl transition-all flex items-center gap-2 uppercase tracking-tighter">
            Reservar Turno
          </Link>
        </div>
      )
  }

  // Fetch Products and Categories
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('productos').select('*').eq('user_id', barber.user_id).eq('activo', true).order('nombre', { ascending: true }),
    supabase.from('categorias_productos').select('*').eq('user_id', barber.user_id).order('nombre', { ascending: true })
  ])

  return (
    <CatalogClient 
      barberConfig={barber} 
      products={products || []} 
      categories={categories || []} 
    />
  )
}
