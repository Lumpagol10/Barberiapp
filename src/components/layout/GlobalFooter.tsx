'use client'

import React, { useState } from 'react'

export function GlobalFooter() {
  const [showLegal, setShowLegal] = useState(false)

  return (
    <>
      <footer className="w-full py-8 text-center flex flex-col items-center justify-center gap-2 mt-auto shrink-0 relative z-10 px-4">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
          Barberiapp • Developed by Franco Lucero
        </p>
        <button 
          onClick={() => setShowLegal(true)}
          className="text-[9px] text-zinc-700 hover:text-amber-500 underline underline-offset-4 transition-colors"
        >
          Términos y Condiciones
        </button>
      </footer>

      {showLegal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">
              Términos de Uso y Privacidad
            </h2>
            <div className="text-zinc-400 text-sm space-y-4 mb-8">
              <p>
                <strong>Propiedad Intelectual:</strong> Esta plataforma, incluyendo su código, 
                diseño, marca Barberiapp y la arquitectura de software, son propiedad exclusiva de 
                Franco Lucero ("Desarrollador"). La suscripción al servicio (SaaS) otorga 
                únicamente una licencia de uso revocable. Queda estrictamente prohibida su copia, 
                reventa o ingeniería inversa.
              </p>
              <p>
                <strong>Protección de Datos:</strong> Los datos de clientes registrados (nombres y 
                teléfonos) pertenecen exclusivamente a la barbería suscripta. Barberiapp provee la 
                infraestructura en la nube pero no vende, cede ni utiliza la base de datos de 
                terceros. La seguridad operativa está garantizada mediante protocolos estándar 
                de la industria, mas el Desarrollador no asume responsabilidad directa por fugas de 
                datos causadas por negligencia en el manejo de credenciales del negocio.
              </p>
              <p>
                Al utilizar la plataforma, la Barbería acepta estas condiciones como 
                contrato de servicio vinculante.
              </p>
            </div>
            <button 
              onClick={() => setShowLegal(false)}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all"
            >
              Entendido y Aceptado
            </button>
          </div>
        </div>
      )}
    </>
  )
}
