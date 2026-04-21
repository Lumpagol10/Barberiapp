'use client'

import React from 'react'
import { MessageCircle, ShoppingBag, ArrowLeft, Store, Globe } from 'lucide-react'
import Link from 'next/link'
import { Producto, CategoriaProducto, ConfiguracionBarberia } from '@/types/dashboard'

interface CatalogClientProps {
  barberConfig: ConfiguracionBarberia
  products: Producto[]
  categories: CategoriaProducto[]
}

export default function CatalogClient({ barberConfig, products, categories }: CatalogClientProps) {
  
  const getWhatsAppLink = (p: Producto) => {
    const cleanNumber = barberConfig.telefono_barbero.replace(/\D/g, '')
    const finalNumber = cleanNumber.startsWith('54') ? cleanNumber : `54${cleanNumber}`
    const message = encodeURIComponent(
      `¡Hola! 💈 Vi este producto en tu catálogo y me interesa:\n\n*${p.nombre}*\n💰 Precio: *$${p.precio.toLocaleString('es-AR')}*\n\n¿Tenés stock disponible?`
    )
    return `https://wa.me/${finalNumber}?text=${message}`
  }

  // Grupar productos por categoría
  const groupedProducts = categories.map(cat => ({
    ...cat,
    prods: products.filter(p => p.categoria_id === cat.id)
  })).filter(cat => cat.prods.length > 0)

  const orphans = products.filter(p => !p.categoria_id || !categories.find(c => c.id === p.categoria_id))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans pb-20 selection:bg-amber-500/30">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Hero Header */}
      <header className="relative z-10 pt-12 pb-8 px-6 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
           <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 rounded-[2rem] border border-amber-600/20 p-1 shadow-2xl overflow-hidden relative group">
              <div className="w-full h-full rounded-[1.8rem] bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden relative">
                {barberConfig.logo_url ? (
                  <img src={barberConfig.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Store className="w-10 h-10 text-zinc-800" />
                )}
              </div>
           </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">
           {barberConfig.nombre_barberia}
        </h1>
        <div className="flex flex-col items-center gap-3">
          <p className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase">Vidriera Digital VIP</p>
          
          <div className="flex gap-2">
            <Link 
              href={`/reserva/${barberConfig.slug}`}
              className="px-6 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-3 h-3" /> RESERVAR TURNO
            </Link>
            {barberConfig.google_maps_link && (
              <a 
                href={barberConfig.google_maps_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
              >
                <Globe className="w-3 h-3" /> UBICACIÓN
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Catalog Content */}
      <main className="relative z-10 px-6 max-w-4xl mx-auto space-y-16 mt-8">
         
         {/* Grouped Categories */}
         {groupedProducts.map((cat) => (
           <section key={cat.id} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-400 px-4">{cat.nombre}</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.prods.map((prod) => (
                  <ProductCard key={prod.id} product={prod} waLink={getWhatsAppLink(prod)} />
                ))}
              </div>
           </section>
         ))}

         {/* General / Orphans */}
         {orphans.length > 0 && (
           <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-400 px-4">Destacados</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orphans.map((prod) => (
                  <ProductCard key={prod.id} product={prod} waLink={getWhatsAppLink(prod)} />
                ))}
              </div>
           </section>
         )}

         {products.length === 0 && (
            <div className="py-32 text-center opacity-20">
               <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
               <p className="text-sm font-black uppercase tracking-widest italic">No hay productos en vidriera actualmente</p>
            </div>
         )}
      </main>

      {/* Floating Back Button (Mobile) */}
      <footer className="fixed bottom-6 left-0 right-0 px-6 z-20 flex justify-center lg:hidden">
         <Link 
           href={`/reserva/${barberConfig.slug}`}
           className="w-full max-w-sm py-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-zinc-400 font-black text-xs rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all uppercase tracking-widest"
         >
           <ArrowLeft className="w-4 h-4" /> Volver a Reserva
         </Link>
      </footer>
    </div>
  )
}

function ProductCard({ product, waLink }: { product: Producto; waLink: string }) {
  return (
    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-amber-500/30 rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col h-full shadow-xl hover:shadow-amber-900/5">
      
      {/* Image Area */}
      <div className="aspect-square relative overflow-hidden bg-zinc-950 flex items-center justify-center">
        {product.imagen_url ? (
          <img 
            src={product.imagen_url} 
            alt={product.nombre} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <ShoppingBag className="w-12 h-12 text-zinc-900" />
        )}
        
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
        
        {/* Price Tag Floating */}
        <div className="absolute bottom-6 left-6">
           <span className="text-3xl font-black text-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
             ${product.precio.toLocaleString('es-AR')}
           </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex flex-col flex-1 space-y-6">
        <div className="space-y-1">
          <h4 className="text-lg font-black uppercase italic tracking-tight leading-tight text-white group-hover:text-amber-500 transition-colors">
            {product.nombre}
          </h4>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Disponible para retiro</p>
        </div>

        <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
        >
          <MessageCircle className="w-5 h-5 fill-current" /> CONSULTAR STOCK
        </a>
      </div>
    </div>
  )
}
