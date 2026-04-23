'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function GlobalFooter() {
  const [showLegal, setShowLegal] = useState(false)

  return (
    <>
      <footer className="w-full py-4 text-center flex flex-col items-center justify-center gap-1.5 shrink-0 relative z-10 px-4">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
          Barberiapp • Developed by Franco Lucero
        </p>
        <button 
          type="button"
          onClick={() => setShowLegal(true)}
          className="text-[9px] text-zinc-700 hover:text-amber-500 underline underline-offset-4 transition-colors"
        >
          Términos y Condiciones
        </button>
      </footer>

      {showLegal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-5 md:p-10 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 fade-in duration-300">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-4 underline decoration-amber-500 underline-offset-8 shrink-0">
              Términos y Privacidad
            </h2>
            <div className="text-zinc-400 text-xs md:text-sm space-y-4 mb-6 overflow-y-auto pr-2 custom-scrollbar">
              <p>
                <strong className="text-amber-500 uppercase text-[10px] tracking-widest block mb-1">Propiedad Intelectual</strong>
                Esta plataforma, incluyendo su código, 
                diseño, marca Barberiapp y la arquitectura de software, son propiedad exclusiva de 
                Franco Lucero ("Desarrollador"). La suscripción al servicio (SaaS) otorga 
                únicamente una licencia de uso revocable. Queda estrictamente prohibida su copia, 
                reventa o ingeniería inversa.
              </p>
              <p>
                <strong className="text-amber-500 uppercase text-[10px] tracking-widest block mb-1">Protección de Datos</strong>
                Los datos de clientes registrados (nombres y 
                teléfonos) pertenecen exclusivamente a la barbería suscripta. Barberiapp provee la 
                infraestructura en la nube pero no vende, cede ni utiliza la base de datos de 
                terceros. La seguridad operativa está garantizada mediante protocolos estándar 
                de la industria, mas el Desarrollador no asume responsabilidad directa por fugas de 
                datos causadas por negligencia en el manejo de credenciales del negocio.
              </p>
              <p className="italic text-[10px]">
                Al utilizar la plataforma, la Barbería acepta estas condiciones como 
                contrato de servicio vinculante.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setShowLegal(false)}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg active:scale-95 shrink-0 mt-auto"
            >
              Entendido y Aceptado
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
