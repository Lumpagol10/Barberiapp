'use client'

import React, { useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { LogOut, Loader2, X } from 'lucide-react'

interface CropperModalProps {
  image: string
  isOpen: boolean
  onClose: () => void
  onSave: (croppedAreaPixels: Area) => Promise<void>
  saving: boolean
}

export default function CropperModal({
  image,
  isOpen,
  onClose,
  onSave,
  saving
}: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  if (!isOpen || !image) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[80vh] relative">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Ajustar Logo</h2>
            <p className="text-zinc-500 text-xs font-medium italic">Centrá y hacé zoom para el encuadre perfecto</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative bg-black/50">
          <Cropper
            image={image}
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
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all border border-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={() => croppedAreaPixels && onSave(croppedAreaPixels)}
              disabled={saving || !croppedAreaPixels}
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
  )
}
