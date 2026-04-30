
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  AlertTriangle,
  Users,
  Activity,
  Clock,
  FileText,
  Bell,
  ShieldCheck,
  Phone,
} from 'lucide-react'
import { io } from 'socket.io-client'
import { submitVictimReport } from '../api/victimAuth'
import { useNavigate } from 'react-router-dom'

/* -------------------- CONSTANTS -------------------- */
const DISASTERS = ['Flood', 'Tsunami', 'Cyclone', 'Landslide', 'Fire', 'Other', 'Unknown']
const DURATION = ['<1-6h', '6-24h', '>24h', 'Unknown']
const SOCKET_URL = 'http://127.0.0.1:5000'

/* -------------------- HELPERS -------------------- */
const cn = (...xs) => xs.filter(Boolean).join(' ')

const isValidLat = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -90 && v <= 90
const isValidLng = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -180 && v <= 180

const formatKey = (key = '') =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const normalizeDispatchedAuthorities = (res) => {
  const raw =
    res?.dispatched_to ||
    res?.dispatched_authorities ||
    res?.saved_dispatches ||
    res?.dispatches ||
    []

  return (Array.isArray(raw) ? raw : []).map((item, idx) => ({
    id: item?.dispatch_id || item?._id || `dispatch-${idx}`,
    authority_id: item?.authority_id || 'N/A',
    authority_name: item?.authority_name || item?.name || 'Unknown Authority',
    authority_type: item?.authority_type || 'N/A',
    status: item?.status || 'pending',
    distance_km:
      item?.distance_km ??
      (item?.distance_m != null ? Number(item.distance_m) / 1000 : null),
    source: item?.source || 'N/A',
  }))
}

const buildFlagRows = (labels = {}, probabilities = {}, thresholds = {}) => {
  const keys = Array.from(
    new Set([
      ...Object.keys(labels || {}),
      ...Object.keys(probabilities || {}),
      ...Object.keys(thresholds || {}),
    ]),
  )

  return keys.map((key) => ({
    flag: key,
    predicted: labels?.[key] ?? 0,
    probability: probabilities?.[key],
    threshold: thresholds?.[key],
  }))
}

const pct = (value) => {
  const n = Number(value)
  if (Number.isNaN(n)) return 'N/A'
  return `${(n * 100).toFixed(1)}%`
}

const buildPriorityPredictionRows = (predictions = {}) => {
  const order = ['Low', 'Moderate', 'Critical']

  return order
    .filter((key) => predictions && Object.prototype.hasOwnProperty.call(predictions, key))
    .map((key) => {
      const item = predictions[key] || {}

      return {
        label: key,
        predicted: Number(item.predicted ?? 0),
        raw_probability: Number(item.raw_probability ?? item.probability ?? 0),
        scaled_probability: Number(item.scaled_probability ?? item.probability ?? 0),
        scaler: Number(item.scaler ?? 1),
      }
    })
}

const buildAuthorityPredictionRows = (predictions = {}) => {
  const order = ['navy', 'fire', 'ambulance', 'police', 'army']

  return order
    .filter((key) => predictions && Object.prototype.hasOwnProperty.call(predictions, key))
    .map((key) => {
      const item = predictions[key] || {}

      return {
        label: key,
        predicted: Number(item.predicted ?? 0),
        probability: Number(item.probability ?? 0),
        threshold: Number(item.threshold ?? 0.5),
      }
    })
}

/* -------------------- UI COMPONENTS -------------------- */
const Chip = ({ active, onClick, children }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'relative w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 border shadow-sm',
      active
        ? 'border-[#9CAF88] bg-[#9CAF88] text-white shadow-md'
        : 'border-[#E8DCC4] bg-white/60 text-[#2D3B2D] hover:bg-white hover:border-[#9CAF88]/50',
    )}
  >
    {children}
    {active && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-0.5"
      >
        <Check size={12} strokeWidth={3} />
      </motion.div>
    )}
  </motion.button>
)

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between gap-6 py-4 border-b border-[#E8DCC4]/30 last:border-0">
    <div>
      <div className="text-base font-semibold text-[#2D3B2D]">{label}</div>
      {desc && <div className="text-sm text-[#2D3B2D]/60 mt-0.5">{desc}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(value ? 0 : 1)}
      className={cn(
        'relative h-8 w-14 rounded-full p-1 transition-colors duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]/50',
        value ? 'bg-[#9CAF88]' : 'bg-[#E8DCC4]',
      )}
      aria-label={label}
    >
      <motion.div
        className="h-6 w-6 rounded-full bg-white shadow-sm"
        animate={{ x: value ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
)

function QuestionBlock({ title, hint, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#E8DCC4]/50 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm space-y-5"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-[#F5EFE6] text-[#9CAF88]">
            <Icon size={20} />
          </div>
        )}
        <div>
          <div className="text-lg font-bold text-[#2D3B2D]">{title}</div>
          {hint && <div className="text-sm text-[#2D3B2D]/60 mt-1">{hint}</div>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

const Stat = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5EFE6]/50 border border-[#E8DCC4]/30">
    {Icon && <Icon size={16} className="mt-0.5 text-[#9CAF88]" />}
    <div>
      <div className="text-xs font-medium text-[#2D3B2D]/50 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-[#2D3B2D] mt-0.5 break-words">{value}</div>
    </div>
  </div>
)

const Badge = ({ children, tone = 'default' }) => {
  const toneClass =
    tone === 'danger'
      ? 'bg-red-100 text-red-700'
      : tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-[#E8DCC4] text-[#2D3B2D]'

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide', toneClass)}>
      {children}
    </span>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white/70 p-4 sm:p-5">
      <h4 className="text-sm font-bold uppercase tracking-wider text-[#9CAF88] mb-3">{title}</h4>
      {children}
    </div>
  )
}

/* -------------------- MAIN -------------------- */
export default function VictimWizard() {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const [incomingRescue, setIncomingRescue] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  const socketRef = useRef(null)

  const victim = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('victim') || 'null')
    } catch {
      return null
    }
  }, [])

  let navigate = (path) => console.log('Navigate to:', path)
  try {
    navigate = useNavigate()
  } catch (e) {}

  const [form, setForm] = useState({
    disaster_type: 'Unknown',
    duration_band: 'Unknown',
    num_people: '',

    children: 0,
    elderly: 0,
    pregnant: 0,
    disability: 0,

    additional_text: '',

    location: null,
    address: '',
    manual_lat: '',
    manual_lng: '',
  })

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!victim?.victim_id) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      console.log('victim socket connected:', socket.id)
      socket.emit('join_victim', { victim_id: victim.victim_id })
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
      console.log('victim socket disconnected')
    })

    socket.on('rescue_accepted', (data) => {
      console.log('rescue_accepted:', data)
      setIncomingRescue(data)
    })

    return () => {
      try {
        socket.emit('leave_victim', { victim_id: victim.victim_id })
      } catch (e) {
        console.error('leave_victim failed:', e)
      }
      socket.disconnect()
      socketRef.current = null
    }
  }, [victim?.victim_id])

  const detectLocation = () => {
    setError('')
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setField('location', { lat: latitude, lng: longitude })
      },
      (err) => {
        console.error(err)
        setError('Could not detect location. Please enable GPS/location permissions or enter address/coordinates.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const getBestLocationForSubmit = () => {
    if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
      return {
        latitude: Number(form.location.lat),
        longitude: Number(form.location.lng),
        source: 'gps',
      }
    }

    const hasManualLat = String(form.manual_lat).trim() !== ''
    const hasManualLng = String(form.manual_lng).trim() !== ''

    const mLat = Number(form.manual_lat)
    const mLng = Number(form.manual_lng)

    if (hasManualLat && hasManualLng && isValidLat(mLat) && isValidLng(mLng)) {
      return {
        latitude: mLat,
        longitude: mLng,
        source: 'manual',
      }
    }

    const addr = String(form.address || '').trim()
    if (addr.length >= 3) {
      return {
        latitude: null,
        longitude: null,
        source: 'address',
        address: addr,
      }
    }

    return {
      latitude: null,
      longitude: null,
      source: 'none',
    }
  }

  const hasGpsLocation =
    form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)

  const hasAddress = String(form.address || '').trim().length >= 3

  const hasManualLocation = (() => {
    const hasLat = String(form.manual_lat).trim() !== ''
    const hasLng = String(form.manual_lng).trim() !== ''
    const lat = Number(form.manual_lat)
    const lng = Number(form.manual_lng)
    return hasLat && hasLng && isValidLat(lat) && isValidLng(lng)
  })()

  const hasStartedManualLocation =
    String(form.manual_lat).trim() !== '' || String(form.manual_lng).trim() !== ''

  const hasAnyLocation = hasGpsLocation || hasAddress || hasManualLocation

  const isStep1Valid = String(form.disaster_type || '').trim() !== '' && hasAnyLocation
  const isStep2Valid = Number(form.num_people) > 0
  const isStep3Valid = true
  const isStep4Valid =
    String(form.duration_band || '').trim() !== '' &&
    String(form.additional_text || '').trim().length >= 5

  const canNext = useMemo(() => {
    if (step === 1) return isStep1Valid
    if (step === 2) return isStep2Valid
    if (step === 3) return isStep3Valid
    if (step === 4) return isStep4Valid
    return true
  }, [step, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid])

  const progressPct = Math.round((step / totalSteps) * 100)

  async function submitAll() {
    setSubmitting(true)
    setError('')
    setResult(null)

    try {
      if (!victim?.victim_id) {
        throw new Error('You must log in first.')
      }

      if (!String(form.disaster_type || '').trim()) {
        throw new Error('Please select the disaster type.')
      }

      if (!hasAnyLocation) {
        throw new Error('Please provide at least one location method: GPS, address, or manual latitude/longitude.')
      }

      if (!Number(form.num_people) || Number(form.num_people) < 1) {
        throw new Error('Please enter how many people need help.')
      }

      if (!String(form.duration_band || '').trim()) {
        throw new Error('Please select the duration.')
      }

      if (String(form.additional_text || '').trim().length < 5) {
        throw new Error('Please enter a short description of the situation.')
      }

      const loc = getBestLocationForSubmit()

      if (loc.source === 'none') {
        throw new Error('Please detect GPS OR enter an address OR enter manual latitude/longitude.')
      }

      const payload = {
        victim_profile_id: victim.victim_id,
        disaster_type: form.disaster_type,
        duration_band: form.duration_band,
        num_people: Number(form.num_people || 0),

        children: Number(form.children) || 0,
        elderly: Number(form.elderly) || 0,
        pregnant: Number(form.pregnant) || 0,
        disability: Number(form.disability) || 0,

        additional_text: String(form.additional_text || '').trim(),

        address: String(form.address || '').trim(),
        manual_address: String(form.address || '').trim(),
      }

      if (loc.source === 'gps' || loc.source === 'manual') {
        payload.latitude = Number(loc.latitude)
        payload.longitude = Number(loc.longitude)
      } else {
        payload.latitude = null
        payload.longitude = null
      }

      console.log('Submitting victim payload:', payload)

      const res = await submitVictimReport(payload)
      console.log('Submit response:', res)

      const dispatchedAuthorities = normalizeDispatchedAuthorities(res)
      const flagRows = buildFlagRows(
        res.nlp_labels || {},
        res.nlp_probabilities || {},
        res.nlp_thresholds || {},
      )

    setResult({
  id: res._id || res.id,
  report_id: res.report_id,
  victim_profile_id: res.victim_profile_id,

  priority_level: res.priority_level,
  priority_label: res.priority_label,
  priority_predictions: res.priority_predictions || {},
  priority_scalers: res.priority_scalers || {},

  authorities: res.authority_list || res.authorities || [],
  authority_predictions: res.authority_predictions || {},

  nlp_labels: res.nlp_labels || {},
  nlp_probabilities: res.nlp_probabilities || {},
  nlp_thresholds: res.nlp_thresholds || {},
  flag_rows: flagRows,

  geo_features: res.geo_features || {},
  nearest_authorities: res.nearest_authorities || [],
  dispatched_authorities: dispatchedAuthorities,
  dispatch_status: res.dispatch_status || '',

  address: res.address,
  latitude: res.latitude,
  longitude: res.longitude,
  original_address: res.original_address,
  resolved_address: res.resolved_address,
  location_source: res.location_source,
})
    } catch (e) {
      console.error('submitAll error:', e)
      setError(String(e?.message || e))
    } finally {
      setSubmitting(false)
    }
  }
const priorityPredictionRows = useMemo(
  () => buildPriorityPredictionRows(result?.priority_predictions || {}),
  [result?.priority_predictions],
)

const authorityPredictionRows = useMemo(
  () => buildAuthorityPredictionRows(result?.authority_predictions || {}),
  [result?.authority_predictions],
)

  const stepInfo = useMemo(() => {
    switch (step) {
      case 1:
        return { title: 'Basic Details', subtitle: 'Select the disaster and provide one location method.' }
      case 2:
        return { title: 'People Affected', subtitle: 'Enter the exact number of affected people.' }
      case 3:
        return { title: 'Vulnerability Check', subtitle: 'These details help estimate urgency.' }
      case 4:
        return { title: 'Final Details', subtitle: 'Duration and message are required before submitting.' }
      default:
        return { title: '', subtitle: '' }
    }
  }, [step])

  const liveLocationText = useMemo(() => {
    if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
      return `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}`
    }

    const mLat = Number(form.manual_lat)
    const mLng = Number(form.manual_lng)
    if (form.manual_lat !== '' && form.manual_lng !== '' && isValidLat(mLat) && isValidLng(mLng)) {
      return `${mLat.toFixed(5)}, ${mLng.toFixed(5)} (manual)`
    }

    if (String(form.address || '').trim().length >= 3) {
      return `${String(form.address).trim()} (address)`
    }

    return 'Not detected'
  }, [form.location, form.manual_lat, form.manual_lng, form.address])

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#2D3B2D] font-sans selection:bg-[#9CAF88] selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8DCC4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-full text-white">
              <Droplets size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#9CAF88] tracking-wider uppercase">RescueSmart</div>
              <h1 className="text-lg font-bold text-[#2D3B2D] leading-none">Emergency Rescue</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <Badge>
                Step {step}/{totalSteps}
              </Badge>

              <span
                className={cn(
                  'text-xs font-bold px-3 py-1 rounded-full border',
                  socketConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200',
                )}
              >
                {socketConnected ? 'Live updates ON' : 'Live updates OFF'}
              </span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-full border border-[#E8DCC4] hover:bg-[#F5EFE6] font-semibold text-sm text-[#2D3B2D] transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {incomingRescue && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <ShieldCheck size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell size={16} className="text-emerald-700" />
                      <div className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                        Rescue Update
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-emerald-900">
                      Help is on the way
                    </h3>

                    <p className="text-emerald-800/80 mt-1">
                      Your dispatch was accepted by an authority unit.
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Stat
                        label="Authority"
                        value={incomingRescue.authority_name || incomingRescue.authority_type || 'Assigned'}
                        icon={ShieldCheck}
                      />
                      <Stat
                        label="Phone"
                        value={
                          incomingRescue.authority_phone ||
                          incomingRescue.phone ||
                          incomingRescue.contact_number ||
                          'Not available'
                        }
                        icon={Phone}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E8DCC4]/50 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#E8DCC4]/40">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider text-[#9CAF88]">
                    Report Wizard
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D3B2D] mt-1">{stepInfo.title}</h2>
                  <p className="text-[#2D3B2D]/60 mt-1">{stepInfo.subtitle}</p>
                </div>

                <div className="hidden sm:block text-right">
                  <div className="text-xs uppercase tracking-wider text-[#2D3B2D]/50 font-bold">
                    Progress
                  </div>
                  <div className="text-2xl font-bold text-[#2D3B2D]">{progressPct}%</div>
                </div>
              </div>

              <div className="h-3 w-full bg-[#E8DCC4]/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#9CAF88]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {step === 1 && (
                <QuestionBlock
                  title="Select the disaster and location"
                  hint="Choose the most relevant disaster type and provide GPS, address, or manual coordinates."
                  icon={AlertTriangle}
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2D3B2D] mb-3">
                        Disaster Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {DISASTERS.map((d) => (
                          <Chip
                            key={d}
                            active={form.disaster_type === d}
                            onClick={() => setField('disaster_type', d)}
                          >
                            {d}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E8DCC4]/40 p-4 bg-[#F5EFE6]/35">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="font-semibold text-[#2D3B2D]">Use current GPS location</div>
                          <div className="text-sm text-[#2D3B2D]/60">
                            Detect your current location automatically
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={detectLocation}
                          className="rounded-xl bg-[#9CAF88] px-4 py-2 text-white font-semibold hover:opacity-95"
                        >
                          Detect GPS
                        </button>
                      </div>

                      <div className="mt-3 text-sm text-[#2D3B2D]/70">
                        Current location: <span className="font-semibold">{liveLocationText}</span>
                      </div>
                    </div>

                    <div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
                          Manual Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={form.manual_lat}
                          onChange={(e) => setField('manual_lat', e.target.value)}
                          placeholder="e.g. 6.9271"
                          className={cn(
                            'w-full rounded-xl border px-4 py-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]',
                            hasStartedManualLocation && !hasManualLocation ? 'border-red-300' : 'border-[#E8DCC4]',
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
                          Manual Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={form.manual_lng}
                          onChange={(e) => setField('manual_lng', e.target.value)}
                          placeholder="e.g. 79.8612"
                          className={cn(
                            'w-full rounded-xl border px-4 py-3 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]',
                            hasStartedManualLocation && !hasManualLocation ? 'border-red-300' : 'border-[#E8DCC4]',
                          )}
                        />
                      </div>
                    </div>

                    {!hasAnyLocation && (
                      <div className="text-xs text-red-600">
                        Please provide at least one location method.
                      </div>
                    )}
                  </div>
                </QuestionBlock>
              )}

              {step === 2 && (
                <QuestionBlock
                  title="How many people need help?"
                  hint="Required. Enter the exact number of affected people."
                  icon={Users}
                >
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-[#2D3B2D]">
                      Number of People Affected
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.num_people}
                      onChange={(e) => setField('num_people', e.target.value)}
                      placeholder="Enter number of people"
                      className={cn(
                        'w-full rounded-xl border bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88]',
                        Number(form.num_people) > 0 ? 'border-[#E8DCC4]' : 'border-red-300',
                      )}
                    />

                    {(!form.num_people || Number(form.num_people) < 1) && (
                      <div className="text-xs text-red-600">
                        Please enter a valid number greater than 0.
                      </div>
                    )}
                  </div>
                </QuestionBlock>
              )}

              {step === 3 && (
                <QuestionBlock
                  title="Vulnerability details"
                  hint="Switch on any condition that applies."
                  icon={Activity}
                >
                  <div>
                    <ToggleRow
                      label="Children affected"
                      desc="Any children involved in this incident"
                      value={form.children}
                      onChange={(v) => setField('children', v)}
                    />
                    <ToggleRow
                      label="Elderly affected"
                      desc="Any elderly persons involved"
                      value={form.elderly}
                      onChange={(v) => setField('elderly', v)}
                    />
                    <ToggleRow
                      label="Pregnant person affected"
                      desc="Pregnant person requires support"
                      value={form.pregnant}
                      onChange={(v) => setField('pregnant', v)}
                    />
                    <ToggleRow
                      label="Person with disability affected"
                      desc="Mobility/support challenges present"
                      value={form.disability}
                      onChange={(v) => setField('disability', v)}
                    />
                  </div>
                </QuestionBlock>
              )}

              {step === 4 && (
                <QuestionBlock
                  title="Final report details"
                  hint="Choose the duration and describe the situation."
                  icon={FileText}
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2D3B2D] mb-3">
                        Time since incident
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DURATION.map((d) => (
                          <Chip
                            key={d}
                            active={form.duration_band === d}
                            onClick={() => setField('duration_band', d)}
                          >
                            {d}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
                        Situation description
                      </label>
                      <textarea
                        rows={5}
                        value={form.additional_text}
                        onChange={(e) => setField('additional_text', e.target.value)}
                        placeholder="Describe what is happening, injuries, blocked roads, rising water, fire, people trapped, or any urgent details."
                        className={cn(
                          'w-full rounded-2xl border px-4 py-3 bg-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-[#9CAF88]',
                          String(form.additional_text || '').trim().length >= 5
                            ? 'border-[#E8DCC4]'
                            : 'border-red-300',
                        )}
                      />
                      <div className="mt-2 text-xs text-[#2D3B2D]/50">
                        Minimum 5 characters.
                      </div>
                    </div>
                  </div>
                </QuestionBlock>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={step === 1 || submitting}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors',
                    step === 1 || submitting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-[#E8DCC4] hover:bg-[#F5EFE6]',
                  )}
                >
                  <ChevronLeft size={18} />
                  Back
                </button>

                {step < totalSteps ? (
                  <button
                    type="button"
                    disabled={!canNext || submitting}
                    onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition-colors',
                      !canNext || submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#9CAF88] hover:opacity-95',
                    )}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canNext || submitting}
                    onClick={submitAll}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition-colors',
                      !canNext || submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700',
                    )}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E8DCC4]/50 shadow-sm p-6">
            <div className="text-sm font-bold uppercase tracking-wider text-[#9CAF88] mb-4">
              Live Summary
            </div>

            <div className="space-y-3">
              <Stat label="Disaster" value={form.disaster_type || 'Not selected'} icon={AlertTriangle} />
              <Stat label="Affected People" value={form.num_people || 'Not entered'} icon={Users} />
              <Stat label="Duration" value={form.duration_band || 'Not selected'} icon={Clock} />
              <Stat label="Location" value={liveLocationText} icon={MapPin} />
            </div>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E8DCC4]/50 shadow-sm p-6">
            <div className="text-sm font-bold uppercase tracking-wider text-[#9CAF88] mb-4">
              Vulnerability Flags
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Children</span>
                <span className="font-semibold">{form.children ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Elderly</span>
                <span className="font-semibold">{form.elderly ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Pregnant</span>
                <span className="font-semibold">{form.pregnant ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Disability</span>
                <span className="font-semibold">{form.disability ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm space-y-5"
            >
              <div className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Submitted Successfully
              </div>

              <div className="space-y-3 text-sm text-emerald-900">
                <div><strong>Report ID:</strong> {result.report_id || result.id || 'N/A'}</div>
                <div><strong>Priority:</strong> {result.priority_label || result.priority_level || 'N/A'}</div>
                <div><strong>Status:</strong> {result.dispatch_status || 'Pending'}</div>
                
              </div>

              <SectionCard title="Predicted Authority Types">
                <div className="flex flex-wrap gap-2">
                  {(result.authorities || []).length ? (
                    result.authorities.map((a) => <Badge key={a}>{formatKey(a)}</Badge>)
                  ) : (
                    <div className="text-sm text-[#2D3B2D]/60">No authority predictions</div>
                  )}
                </div>
              </SectionCard>
  
  <SectionCard title="NLP Hazard Threshold Details">
  {result?.flag_rows?.length ? (
    <div className="space-y-3">
      {result.flag_rows.map((row) => (
        <div
          key={row.flag}
          className="rounded-xl border border-[#E8DCC4]/40 bg-[#F5EFE6]/50 p-3"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#2D3B2D]">
                {formatKey(row.flag)}
              </span>
              <Badge tone={row.predicted ? 'success' : 'default'}>
                {row.predicted ? 'Detected' : 'Not Detected'}
              </Badge>
            </div>

            <div className="text-xs text-[#2D3B2D]/70">
              Threshold: <span className="font-semibold">{Number(row.threshold ?? 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat label="Probability" value={pct(row.probability)} />
            <Stat label="Threshold" value={Number(row.threshold ?? 0).toFixed(2)} />
          </div>

          <div className="mt-3">
            <div className="text-xs text-[#2D3B2D]/60 mb-1">Probability</div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[#9CAF88]"
                style={{
                  width: `${Math.max(0, Math.min(100, Number(row.probability ?? 0) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-sm text-[#2D3B2D]/60">
      No NLP threshold details available.
    </div>
  )}
</SectionCard> 
              <SectionCard title="Nearest Authorities">
                {(result.nearest_authorities || []).length ? (
                  <div className="space-y-2">
                    {result.nearest_authorities.map((a, idx) => (
                      <div
                        key={`${a.authority_id || idx}-${idx}`}
                        className="rounded-xl border border-[#E8DCC4]/30 bg-white/70 p-3"
                      >
                        <div className="font-semibold text-[#2D3B2D]">
                          {a.name || a.authority_name || 'Unknown Authority'}
                        </div>
                        <div className="mt-1 text-xs text-[#2D3B2D]/80 space-y-1">
                          <div><strong>ID:</strong> {a.authority_id || 'N/A'}</div>
                          <div><strong>Type:</strong> {a.authority_type || 'N/A'}</div>
                          <div>
                            <strong>Distance:</strong>{' '}
                            {a.distance_km != null
                              ? `${Number(a.distance_km).toFixed(2)} km`
                              : a.distance_m != null
                              ? `${(Number(a.distance_m) / 1000).toFixed(2)} km`
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#2D3B2D]/60">No nearest authorities found</div>
                )}
              </SectionCard>

              <SectionCard title="Dispatched Authorities">
                {(result.dispatched_authorities || []).length ? (
                  <div className="space-y-2">
                    {result.dispatched_authorities.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-emerald-200 bg-white p-3"
                      >
                        <div className="font-semibold text-emerald-900">
                          {a.authority_name}
                        </div>
                        <div className="mt-1 text-xs text-emerald-800/90 space-y-1">
                          <div><strong>ID:</strong> {a.authority_id}</div>
                          <div><strong>Type:</strong> {a.authority_type}</div>
                          <div><strong>Status:</strong> {a.status}</div>
                          <div>
                            <strong>Distance:</strong>{' '}
                            {a.distance_km != null ? `${Number(a.distance_km).toFixed(2)} km` : 'N/A'}
                          </div>
                          <div><strong>Source:</strong> {a.source}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#2D3B2D]/60">
                    
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}
        </aside>
      </main>
    </div>
  )
}