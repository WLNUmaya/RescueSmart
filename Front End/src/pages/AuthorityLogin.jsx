
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react'
import { loginAuthorityProfile } from '../api/authorityAuth'

export default function AuthorityLogin() {
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
      const data = await loginAuthorityProfile({
        email: email.trim(),
        password,
      })

      localStorage.setItem('authority', JSON.stringify(data))
      navigate('/authority')
    } catch (e2) {
      setErr(e2?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4 sm:p-6 font-sans text-[#2D3B2D]">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Branding */}
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
            Coordinate Response. <br />
            <span className="text-[#9CAF88]">Save Lives.</span>
          </h1>

          <p className="text-xl text-[#2D3B2D]/70 max-w-md leading-relaxed">
            Access the centralized dashboard to manage emergency dispatches,
            track resources, and coordinate with field teams in real-time.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#F5EFE6] bg-[#E8DCC4] flex items-center justify-center text-xs font-bold text-[#2D3B2D]/50"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm font-semibold text-[#2D3B2D]/60">
              Trusted by 500+ authorities
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E8DCC4]/50">
            <div className="mb-8 text-center md:text-left">
              <div className="md:hidden inline-flex items-center gap-2 mb-4 justify-center">
                <div className="bg-[#87CEEB] p-2 rounded-xl text-white">
                  <Droplets size={20} fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-[#2D3B2D]">
                  RescueSmart
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#2D3B2D]">
                Authority Login
              </h2>
              <p className="text-[#2D3B2D]/60 mt-2">
                Enter your credentials to access the command center.
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
                    placeholder="authority@rescuesmart.com"
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
                className="w-full rounded-xl bg-[#9CAF88] py-3.5 text-white font-bold shadow-lg shadow-[#9CAF88]/20 hover:bg-[#7A9A6D] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  'Authenticating...'
                ) : (
                  <>
                    Login to Dashboard <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-[#E8DCC4]/50">
              <p className="text-sm text-[#2D3B2D]/60">
                New authority unit?{' '}
                <Link
                  className="text-[#5BA4C9] font-bold hover:text-[#4A93B8] transition-colors"
                  to="/authority/register"
                >
                  Register your unit
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
