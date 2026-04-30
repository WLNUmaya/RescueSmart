
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Droplets,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { registerAuthorityProfile } from '../api/authorityAuth'

function InputField({ icon: Icon, label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[#2D3B2D]/70 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40"
          size={16}
        />
        <input
          className="w-full rounded-xl border border-[#E8DCC4] bg-[#F5EFE6]/30 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all placeholder:text-[#2D3B2D]/30"
          {...props}
        />
      </div>
    </div>
  )
}

export default function AuthorityRegister() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [authorityType, setAuthorityType] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [generatedAuthorityId, setGeneratedAuthorityId] = useState('')

  async function onSubmit(e) {
    e.preventDefault()

    if (loading) return

    setErr('')
    setOk('')
    setGeneratedAuthorityId('')
    setLoading(true)

    try {
      const latNum = parseFloat(latitude)
      const lngNum = parseFloat(longitude)

      if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
        throw new Error('Please enter valid latitude and longitude values.')
      }

      const payload = {
        name: name.trim(),
        authority_type: authorityType.trim(),
        district: district.trim(),
        address: address.trim(),
        phone: phone.trim(),
        latitude: latNum,
        longitude: lngNum,
        email: email.trim().toLowerCase(),
        password,
      }

      const res = await registerAuthorityProfile(payload)

      const newAuthorityId = res?.authority_id || ''
      setGeneratedAuthorityId(newAuthorityId)
      setOk(
        newAuthorityId
          ? `Registered successfully! Your Authority ID is ${newAuthorityId}. Redirecting...`
          : 'Registered successfully! Redirecting...'
      )

      setTimeout(() => {
        navigate('/authority/login')
      }, 1800)
    } catch (e2) {
      setErr(e2?.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4 sm:p-6 font-sans text-[#2D3B2D]">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:col-span-2 flex-col justify-center space-y-6 p-8 sticky top-8"
        >
          <div className="inline-flex items-center gap-3">
            <div className="bg-[#87CEEB] p-3 rounded-2xl text-white shadow-lg shadow-[#87CEEB]/20">
              <Droplets size={32} fill="currentColor" />
            </div>
            <span className="text-3xl font-bold text-[#2D3B2D]">
              RescueSmart
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-[#2D3B2D]">
            Join the Network
          </h1>

          <p className="text-lg text-[#2D3B2D]/70 leading-relaxed">
            Register your authority unit to start receiving real-time emergency
            dispatches. You&apos;ll be connected to our central command
            instantly.
          </p>

          <div className="bg-white/60 rounded-2xl p-6 border border-[#E8DCC4]">
            <h3 className="font-bold text-[#2D3B2D] mb-2">
              Registration Checklist
            </h3>
            <ul className="space-y-2 text-sm text-[#2D3B2D]/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#9CAF88]" />
                Authority type
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#9CAF88]" />
                Unit name
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#9CAF88]" />
                Office address
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#9CAF88]" />
                GPS Coordinates of HQ
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#9CAF88]" />
                Emergency Contact Number
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:col-span-3"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8DCC4]/50">
            <div className="mb-8">
              <div className="lg:hidden inline-flex items-center gap-2 mb-4">
                <div className="bg-[#87CEEB] p-2 rounded-xl text-white">
                  <Droplets size={20} fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-[#2D3B2D]">
                  RescueSmart
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#2D3B2D]">
                Register Authority Unit
              </h2>
              <p className="text-[#2D3B2D]/60 mt-1">
                Create your official profile for dispatch coordination.
              </p>
            </div>

            {err && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            )}

            {ok && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-100 p-4 flex items-start gap-3 text-green-700 text-sm">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span>{ok}</span>
                  {generatedAuthorityId && (
                    <span className="font-semibold">
                      Generated ID: {generatedAuthorityId}
                    </span>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#9CAF88] uppercase tracking-wider border-b border-[#E8DCC4] pb-2">
                  Unit Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D3B2D]/70 uppercase tracking-wider ml-1">
                      Authority ID
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40"
                        size={16}
                      />
                      <input
                        className="w-full rounded-xl border border-[#E8DCC4] bg-[#ECE7DD] pl-10 pr-4 py-2.5 text-sm text-[#2D3B2D]/55 cursor-not-allowed"
                        value={
                          generatedAuthorityId ||
                          ''
                        }
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D3B2D]/70 uppercase tracking-wider ml-1">
                      Type
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40"
                        size={16}
                      />
                      <select
                        className="w-full rounded-xl border border-[#E8DCC4] bg-[#F5EFE6]/30 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all appearance-none text-[#2D3B2D]"
                        value={authorityType}
                        onChange={(e) => setAuthorityType(e.target.value)}
                        required
                      >
                        <option value="">Select type...</option>
                        <option value="hospital">Hospital</option>
                        <option value="police">Police</option>
                        <option value="fire">Fire Dept</option>
                        <option value="army">Army</option>
                        <option value="navy">Navy</option>
                        <option value="ambulance">Ambulance</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2D3B2D]/40">
                        ▾
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      icon={Building2}
                      label="Unit Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Central District Fire Station"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#9CAF88] uppercase tracking-wider border-b border-[#E8DCC4] pb-2">
                  Location & Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={MapPin}
                    label="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Colombo"
                  />

                  <InputField
                    icon={MapPin}
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. No. 25, Main Street, Colombo 07"
                  />

                  <InputField
                    icon={Phone}
                    label="Emergency Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94xxxxxxxxx"
                  />

                  <div></div>

                  <InputField
                    icon={Globe}
                    label="Latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="6.9271"
                    required
                  />

                  <InputField
                    icon={Globe}
                    label="Longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="79.8612"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#9CAF88] uppercase tracking-wider border-b border-[#E8DCC4] pb-2">
                  Account Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="unit@authority.gov"
                    required
                  />

                  <InputField
                    icon={Lock}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#9CAF88] py-4 text-white font-bold shadow-lg shadow-[#9CAF88]/20 hover:bg-[#7A9A6D] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  'Registering...'
                ) : (
                  <>
                    Complete Registration <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#2D3B2D]/60">
                Already have an account?{' '}
                <Link
                  className="text-[#5BA4C9] font-bold hover:text-[#4A93B8] transition-colors"
                  to="/authority/login"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}