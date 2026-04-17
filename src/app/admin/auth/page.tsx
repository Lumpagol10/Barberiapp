'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Scissors, Lock, Mail, User, ArrowRight } from 'lucide-react'

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
      setError(err.message || 'Error en la autenticación')
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-zinc-600 text-white"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm italic ml-1 animate-pulse">{error}</p>}

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
