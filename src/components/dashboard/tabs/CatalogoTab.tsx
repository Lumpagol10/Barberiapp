'use client'

import React, { useState } from 'react'
import { 
  Store, Plus, Trash2, Edit3, Image as ImageIcon, 
  ExternalLink, Copy, CheckCircle2, Package, Tag, Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Producto, CategoriaProducto, ConfiguracionBarberia } from '@/types/dashboard'
import DashboardHeader from '../DashboardHeader'

interface CatalogoTabProps {
  config: ConfiguracionBarberia | null
  products: Producto[]
  categories: CategoriaProducto[]
  onRefresh: () => void
  onToggleActive: (val: boolean) => void
  onOpenSidebar: () => void
  userId?: string
}

export default function CatalogoTab({
  config,
  products,
  categories,
  onRefresh,
  onToggleActive,
  onOpenSidebar,
  userId
}: CatalogoTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  
  // Product Form State
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCategory, setProdCategory] = useState('')
  const [prodImage, setProdImage] = useState<string | null>(null)
  const [prodImageFile, setProdImageFile] = useState<File | null>(null)

  // Category State
  const [newCatName, setNewCatName] = useState('')

  // FIX: Asegurar link de producción incluso en localhost
  const catalogUrl = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost'
        ? `https://Barberiapp-v2.vercel.app/catalogo/${config?.slug}` // URL base de producción detectada
        : `${window.location.origin}/catalogo/${config?.slug}`)
    : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl)
    toast.success('✅ Link del catálogo copiado')
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !userId) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('categorias_productos').insert([{
        user_id: userId,
        nombre: newCatName.toUpperCase()
      }])
      if (error) throw error
      setNewCatName('')
      onRefresh()
      toast.success('Subsección creada')
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Seguro quieres eliminar esta subsección? Los productos asociados se quedarán sin categoría.')) return
    try {
      const { error } = await supabase.from('categorias_productos').delete().eq('id', id)
      if (error) throw error
      onRefresh()
      toast.success('Subsección eliminada')
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProdImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setProdImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setIsSaving(true)
    
    try {
      let finalImageUrl = prodImage
      
      // 1. Upload image if new
      if (prodImageFile) {
        const fileName = `${userId}/products/${Date.now()}.jpg`
        const { error: upError } = await supabase.storage.from('barberia_logos').upload(fileName, prodImageFile)
        if (upError) throw upError
        const { data: { publicUrl } } = supabase.storage.from('barberia_logos').getPublicUrl(fileName)
        finalImageUrl = publicUrl
      }

      const productData = {
        user_id: userId,
        nombre: prodName.toUpperCase(),
        precio: Number(prodPrice),
        categoria_id: prodCategory || null,
        imagen_url: finalImageUrl,
        activo: true
      }

      if (editingProduct) {
        const { error } = await supabase.from('productos').update(productData).eq('id', editingProduct.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase.from('productos').insert([productData])
        if (error) throw error
        toast.success('Producto creado')
      }

      setShowProductModal(false)
      setEditingProduct(null)
      onRefresh()
      // RESET FORM
      setProdName('')
      setProdPrice('')
      setProdCategory('')
      setProdImage(null)
      setProdImageFile(null)
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      onRefresh()
      toast.success('Producto eliminado')
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    }
  }

  const openProductModal = (p: Producto | null = null) => {
    if (p) {
      setEditingProduct(p)
      setProdName(p.nombre)
      setProdPrice(p.precio.toString())
      setProdCategory(p.categoria_id || '')
      setProdImage(p.imagen_url)
    } else {
      setEditingProduct(null)
      setProdName('')
      setProdPrice('')
      setProdCategory('')
      setProdImage(null)
    }
    setProdImageFile(null)
    setShowProductModal(true)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <DashboardHeader 
        title="Gestión de Catálogo"
        config={config}
        onOpenSidebar={onOpenSidebar}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Lado Izquierdo: Configuración General y Categorías */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Switch de Activación */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Estado del Catálogo</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Habilitar vidriera para clientes</p>
              </div>
              <button 
                onClick={() => onToggleActive(!config?.catalogo_activo)}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 ${config?.catalogo_activo ? 'bg-amber-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${config?.catalogo_activo ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            {config?.catalogo_activo && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tu Link de Catálogo:</p>
                  <div className="flex items-center justify-between gap-3 text-xs font-bold text-amber-500 truncate mb-4">
                    <span className="truncate">{catalogUrl}</span>
                    <button onClick={handleCopyLink} className="p-2 hover:bg-amber-500/10 rounded-lg transition-all shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <a 
                    href={catalogUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <ExternalLink className="w-3 h-3" /> VER VIDRIERA
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Gestión de Subsecciones (Categorías) */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-zinc-800 rounded-lg">
                 <Layers className="w-4 h-4 text-amber-500" />
               </div>
               <h3 className="text-lg font-black uppercase italic tracking-tighter text-zinc-200">Subsecciones</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ejem: ACEITES"
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold focus:border-amber-500/50 outline-none uppercase"
                />
                <button 
                  onClick={handleCreateCategory}
                  disabled={isSaving || !newCatName.trim()}
                  className="p-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              <div className="space-y-2 min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {categories.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 font-bold italic py-4">No hay subsecciones creadas.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-950/30 border border-zinc-800/50 rounded-xl group transition-all hover:border-zinc-700">
                      <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">{cat.nombre}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Listado de Productos */}
        <div className="xl:col-span-2 space-y-6">
           <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-4 sm:p-6 lg:p-10 backdrop-blur-xl min-h-[600px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                <div>
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mis Productos</h3>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Gestioná tu stock y precios</p>
                </div>
                <button 
                  onClick={() => openProductModal()}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> AGREGAR PRODUCTO
                </button>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
                  <Package className="w-20 h-20 text-zinc-600 mb-6" />
                  <h4 className="text-xl font-black uppercase italic">Catálogo Vacío</h4>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Empezá cargando tu primer producto</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {products.map((prod) => {
                    const category = categories.find(c => c.id === prod.categoria_id)
                    return (
                      <div key={prod.id} className="group relative bg-zinc-950/40 border border-zinc-800 hover:border-amber-500/30 rounded-3xl overflow-hidden transition-all flex flex-col">
                        
                        {/* Imagen del Producto */}
                        <div className="aspect-square w-full relative bg-zinc-900 flex items-center justify-center overflow-hidden">
                          {prod.imagen_url ? (
                            <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-zinc-800" />
                          )}
                          <div className="absolute top-4 right-4 flex gap-2 translate-y-0 opacity-100 lg:translate-y-[-10px] lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all">
                             <button onClick={() => openProductModal(prod)} className="p-2 bg-black/60 backdrop-blur-md text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black">
                               <Edit3 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 bg-black/60 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                             {category && (
                               <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-zinc-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5">
                                 {category.nombre}
                               </span>
                             )}
                             {/* QUICK STOCK TOGGLE */}
                             <button 
                                onClick={async () => {
                                    const { error } = await supabase.from('productos').update({ activo: !prod.activo }).eq('id', prod.id)
                                    if (!error) onRefresh()
                                }}
                                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${prod.activo ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-red-500/80 text-white border-red-400'}`}
                             >
                                {prod.activo ? 'EN STOCK' : 'SIN STOCK'}
                             </button>
                          </div>
                        </div>

                        {/* Info del Producto */}
                        <div className="p-5 flex flex-col flex-1">
                           <h4 className="text-sm font-black uppercase text-zinc-100 truncate">{prod.nombre}</h4>
                           <div className="mt-auto flex items-center justify-between pt-4">
                              <span className="text-xl font-black text-amber-500">${prod.precio.toLocaleString('es-AR')}</span>
                              <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${prod.activo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {prod.activo ? 'Disponible' : 'Sin Stock'}
                              </div>
                           </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Modal de Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/20">
               <div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Completá los detalles del artículo</p>
               </div>
               <button onClick={() => setShowProductModal(false)} className="p-3 hover:bg-zinc-800 rounded-2xl transition-all">
                 <Copy className="rotate-45 w-5 h-5 text-zinc-500" />
               </button>
             </div>

             <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                
                {/* Upload Image Section */}
                <div className="flex justify-center">
                  <label className="relative w-40 h-40 group cursor-pointer">
                    <div className="w-full h-full bg-zinc-950 border-2 border-dashed border-zinc-800 group-hover:border-amber-500 transition-all rounded-[2rem] flex flex-col items-center justify-center overflow-hidden">
                      {prodImage ? (
                        <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 text-zinc-700 group-hover:text-amber-500 transition-colors mb-2" />
                          <span className="text-[9px] font-black text-zinc-600 uppercase">Subir Foto</span>
                        </>
                      )}
                    </div>
                    <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Nombre del Producto</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                      <input 
                        required 
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Ejem: CERA EFECTO MATE"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm font-bold uppercase focus:border-amber-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Precio ($)</label>
                      <input 
                        required 
                        type="number"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="2500"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-sm font-bold focus:border-amber-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Subsección</label>
                      <select 
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-sm font-bold focus:border-amber-500 transition-all outline-none uppercase appearance-none"
                      >
                        <option value="">Sin Categoría</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isSaving}
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? 'GUARDANDO...' : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> 
                      {editingProduct ? 'ACTUALIZAR PRODUCTO' : 'CREAR PRODUCTO'}
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
