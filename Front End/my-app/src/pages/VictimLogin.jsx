
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Droplets,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Users,
} from 'lucide-react'
import { loginVictimProfile } from '../api/victimAuth'

export default function VictimLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      const data = await loginVictimProfile({
        email: email.trim().toLowerCase(),
        password,
      })

      localStorage.setItem('victim', JSON.stringify(data))
      navigate('/victim')
    } catch (e2) {
      setErr(e2?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4 sm:p-6 font-sans text-[#2D3B2D]">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col justify-center space-y-6 p-8"
        >
          <div className="inline-flex items-center gap-3">
            <div className="bg-[#87CEEB] p-3 rounded-2xl text-white shadow-lg shadow-[#87CEEB]/20">
              <Droplets size={32} fill="currentColor" />
            </div>
            <span className="text-3xl font-bold text-[#2D3B2D]">
              RescueSmart
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight text-[#2D3B2D]">
            Get Help Fast. <br />
            <span className="text-[#9CAF88]">Stay Connected.</span>
          </h1>

          <p className="text-xl text-[#2D3B2D]/70 max-w-md leading-relaxed">
            Log in to send emergency requests, share your location, and receive
            support updates from rescue authorities in real-time.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <div className="bg-white/70 border border-[#E8DCC4] rounded-2xl px-4 py-3 flex items-center gap-3">
              <Users className="text-[#5BA4C9]" size={20} />
              <span className="text-sm font-semibold text-[#2D3B2D]/70">
                Safe, simple access for victims
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E8DCC4]/50">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#2D3B2D]">
                Victim Login
              </h2>
              <p className="text-[#2D3B2D]/60 mt-2">
                Enter your account details to access emergency support services.
              </p>
            </div>

            {err && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-red-700 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{err}</span>
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2D3B2D]/80 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40"
                    size={18}
                  />
                  <input
                    className="w-full rounded-xl border border-[#E8DCC4] bg-[#F5EFE6]/30 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all placeholder:text-[#2D3B2D]/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="victim@gmail.com"
                    required
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2D3B2D]/80 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#E8DCC4] bg-[#F5EFE6]/30 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all placeholder:text-[#2D3B2D]/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-[#9CAF88] py-3.5 text-white font-bold shadow-lg shadow-[#9CAF88]/20 hover:bg-[#7A9A6D] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : <>Login <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-[#E8DCC4]/50">
              <p className="text-sm text-[#2D3B2D]/60">
                Don&apos;t have an account?{' '}
                <Link
                  className="text-[#5BA4C9] font-bold hover:text-[#4A93B8] transition-colors"
                  to="/victim/register"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}