'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Scissors, Lock, Mail, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getDebugInfo = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'FALTANTE'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'FALTANTE'
    return {
      hasUrl: url !== 'FALTANTE',
      hasKey: key !== 'FALTANTE',
      urlStart: url.substring(0, 15),
      keyStart: key.substring(0, 8),
      isHttps: url.startsWith('https://')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('CRÍTICO: Faltan las llaves de Supabase en las variables de entorno.')
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard/onboarding')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        alert('Registro exitoso. Revisa tu email para confirmar o inicia sesión.')
        setIsLogin(true)
      }
    } catch (err: any) {
      console.error('Detalle error auth:', err)
      if (err.message === 'Failed to fetch') {
        setError('Error de conexión: No se pudo contactar con el servidor. Verifica las llaves de Supabase en Vercel.')
      } else {
        setError(err.message || 'Error en la autenticación')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/5 rounded-full blur-[120px]" />

      <header className="mb-8 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-900/30">
            <Scissors className="w-8 h-8 text-black" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl mb-2">
          BARBERI<span className="text-amber-500">APP</span>
        </h1>
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Admin Portal</p>
      </header>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex mb-8 bg-zinc-800/30 p-1 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                isLogin ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                !isLogin ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Franco Martínez"
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="barberia@ejemplo.com"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all placeholder:text-zinc-600 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-red-500 text-sm font-medium leading-tight">{error}</p>
                    <button 
                      type="button"
                      onClick={() => setShowDebug(!showDebug)}
                      className="text-[10px] text-amber-500 font-bold uppercase tracking-widest hover:underline"
                    >
                      {showDebug ? 'Ocultar Diagnóstico' : 'Ver Diagnóstico del Sistema'}
                    </button>
                  </div>
                </div>

                {showDebug && (
                  <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/30 font-mono text-[10px] space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <span className="text-zinc-500 uppercase">Estado Conexión</span>
                      <span className={getDebugInfo().hasUrl ? 'text-green-500' : 'text-red-500'}>
                        {getDebugInfo().hasUrl ? 'DETECTADO' : 'CUIDADO: FALTANTE'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-500 uppercase">URL (Inicio):</p>
                      <p className="text-zinc-300 break-all">{getDebugInfo().urlStart}...</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-500 uppercase">KEY (Inicio):</p>
                      <p className="text-zinc-300 break-all">{getDebugInfo().keyStart}...</p>
                    </div>
                    <div className="flex justify-between items-center text-zinc-500">
                      <span>Protocolo Seguro (HTTPS)</span>
                      <span className={getDebugInfo().isHttps ? 'text-green-500' : 'text-red-500'}>
                        {getDebugInfo().isHttps ? 'SI' : 'NO'}
                      </span>
                    </div>
                    <p className="text-zinc-700 italic border-t border-zinc-800 pt-2">
                      Si algo dice FALTANTE, verifica Vercel y haz un Redeploy.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-lg rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-amber-900/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'INGRESAR AL PANEL' : 'CREAR MI CUENTA'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-zinc-600 text-sm">
            Exclusivo para dueños de barberías asociados a <span className="text-zinc-500 font-semibold tracking-tighter">Franmark Digital</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
