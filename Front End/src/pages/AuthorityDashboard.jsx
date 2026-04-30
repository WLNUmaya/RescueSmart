
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  LogOut,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Baby,
  Activity,
  Ambulance,
  Radio,
} from 'lucide-react'

const SOCKET_URL = 'http://127.0.0.1:5000'
const API_BASE = 'http://127.0.0.1:5000/api/v1'


function normalizeDispatchItem(item) {
  if (!item) return { victim: {}, dispatch: {} }

  
  if (item.victim || item.dispatch) {
    return {
      victim: item.victim || {},
      dispatch: item.dispatch || {},
    }
  }

  const victim = { ...item }

 
  const dispatch =
    (Array.isArray(item.dispatches) && item.dispatches[0]) ||
    (Array.isArray(item.saved_dispatches) && item.saved_dispatches[0]) ||
    {}

  return { victim, dispatch }
}

export default function AuthorityDashboard() {
  const navigate = useNavigate()
  const socketRef = useRef(null)

  const authority = useMemo(() => {
    const raw = localStorage.getItem('authority')
    return raw ? JSON.parse(raw) : null
  }, [])

  useEffect(() => {
    if (!authority?.authority_id) navigate('/authority/login')
  }, [authority, navigate])

  const authorityRoomId = authority?.authority_id

  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)

 
  useEffect(() => {
    if (!authorityRoomId) return

    async function loadDispatches() {
      try {
        const res = await fetch(`${API_BASE}/dispatches/authority/${authorityRoomId}`)
        const data = await res.json()

        const list = Array.isArray(data) ? data : []
        const normalized = list.map(normalizeDispatchItem)

        setDispatches(normalized)
      } catch (err) {
        console.error('Failed to load dispatches:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDispatches()
  }, [authorityRoomId])

 
  useEffect(() => {
    if (!authorityRoomId) return

    const socket = io(SOCKET_URL, {
      transports: ['polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 800,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log(' Socket connected:', socket.id)
      socket.emit('join_authority', { authority_id: authorityRoomId })
    })

    socket.on('new_dispatch', (payload) => {
      // payload can be victim-doc or {victim, dispatch}
      const normalized = normalizeDispatchItem(payload)

      setDispatches((prev) => {
        const newId =
          normalized.dispatch?._id ||
          normalized.victim?._id ||
          normalized.dispatch?.victim_id

        const exists = prev.some((x) => {
          const oldId = x.dispatch?._id || x.victim?._id || x.dispatch?.victim_id
          return oldId && newId && oldId === newId
        })

        return exists ? prev : [normalized, ...prev]
      })
    })

    return () => {
      try {
        socket.emit('leave_authority', { authority_id: authorityRoomId })
      } catch (e) {}
      socket.disconnect()
    }
  }, [authorityRoomId])

  function handleLogout() {
    localStorage.removeItem('authority')
    navigate('/authority/login')
  }


  const stats = useMemo(() => {
    const high = dispatches.filter((x) =>
      String(x?.dispatch?.priority_label || x?.dispatch?.priority_level || x?.victim?.priority_label || '')
        .toLowerCase()
        .includes('high'),
    ).length

    const medium = dispatches.filter((x) =>
      String(x?.dispatch?.priority_label || x?.dispatch?.priority_level || x?.victim?.priority_label || '')
        .toLowerCase()
        .includes('medium'),
    ).length

    return { total: dispatches.length, high, medium }
  }, [dispatches])

  return (
    <div className="min-h-screen bg-[#F5EFE6] font-sans text-[#2D3B2D]">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8DCC4]/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#87CEEB] p-2 rounded-xl text-white">
              <Droplets size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#9CAF88] tracking-wider uppercase">
                Command Center
              </div>
              <h1 className="text-lg font-bold text-[#2D3B2D] leading-none">
                RescueSmart
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#E8DCC4]/30 rounded-full border border-[#E8DCC4]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-[#2D3B2D]/70 uppercase tracking-wide">
                System Online
              </span>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-[#E8DCC4]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#2D3B2D]">
                  {authority?.name || 'Authority Unit'}
                </div>
                <div className="text-[10px] font-mono text-[#2D3B2D]/50">
                  {authority?.authority_id}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-[#2D3B2D]/60 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[#E8DCC4]/50 shadow-sm">
            <div className="text-xs font-bold text-[#2D3B2D]/50 uppercase tracking-wider mb-1">
              Total Active
            </div>
            <div className="text-3xl font-bold text-[#2D3B2D]">{stats.total}</div>
          </div>

          <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
            <div className="text-xs font-bold text-red-800/50 uppercase tracking-wider mb-1">
              High Priority
            </div>
            <div className="text-3xl font-bold text-red-700">{stats.high}</div>
          </div>

          <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
            <div className="text-xs font-bold text-amber-800/50 uppercase tracking-wider mb-1">
              Medium Priority
            </div>
            <div className="text-3xl font-bold text-amber-700">{stats.medium}</div>
          </div>

          <div className="bg-[#87CEEB]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#87CEEB]/20 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#5BA4C9] uppercase tracking-wider mb-1">
                Live Feed
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2D3B2D]">
                <Radio size={16} className="animate-pulse text-[#9CAF88]" />
                Listening...
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2D3B2D]">Incoming Dispatches</h2>
            {loading && (
              <span className="text-sm text-[#2D3B2D]/50 animate-pulse">
                Syncing data...
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-white/40 animate-pulse border border-[#E8DCC4]/30"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {dispatches.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-16 text-center bg-white/40 rounded-3xl border border-dashed border-[#E8DCC4]"
                  >
                    <div className="bg-[#F5EFE6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ambulance size={32} className="text-[#9CAF88]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2D3B2D]">
                      No Active Dispatches
                    </h3>
                    <p className="text-[#2D3B2D]/60">
                      Your unit is currently on standby. Stay alert.
                    </p>
                  </motion.div>
                )}

                {dispatches.map((item, idx) => {
                  const d = item.dispatch || {}
                  const v = item.victim || {}

                  const key = d._id || v._id || `${d.victim_id || 'v'}-${idx}`

                  const isHighPriority = String(
                    d.priority_label || v.priority_label || d.priority_level || v.priority_level || '',
                  )
                    .toLowerCase()
                    .includes('high')

                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`rounded-3xl bg-white p-6 shadow-sm border transition-all hover:shadow-md ${
                        isHighPriority ? 'border-red-100 ring-1 ring-red-50' : 'border-[#E8DCC4]/50'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl ${
                              isHighPriority ? 'bg-red-100 text-red-600' : 'bg-[#F5EFE6] text-[#9CAF88]'
                            }`}
                          >
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#2D3B2D]/50 uppercase tracking-wider">
                              Incident Report
                            </div>
                            <div className="font-bold text-lg text-[#2D3B2D]">
                              {v.disaster_type || 'Unknown Incident'}
                            </div>
                          </div>
                        </div>

                        {isHighPriority && (
                          <span className="animate-pulse inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-2 text-sm text-[#2D3B2D]/80">
                          <MapPin size={16} className="mt-0.5 text-[#9CAF88] shrink-0" />
                          <span>
                            <span className="font-semibold">{v.area_type || 'Unknown'}</span> • Risk:{' '}
                            {v.area_risk_level || 'Unknown'}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-[#2D3B2D]/80">
                          <Clock size={16} className="mt-0.5 text-[#9CAF88] shrink-0" />
                          <span>Duration: {v.duration_band || 'Unknown'}</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-[#2D3B2D]/80">
                          <Users size={16} className="mt-0.5 text-[#9CAF88] shrink-0" />
                          <span>
                            Affected:{' '}
                            <span className="font-semibold">
                              {v.affected_victim_count ?? v.victim_count_band ?? 'Unknown'}
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {Number(v.children) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                              <Baby size={12} /> Children
                            </span>
                          )}
                          {Number(v.pregnant) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-bold border border-pink-100">
                              <Activity size={12} /> Pregnant
                            </span>
                          )}
                          {Number(v.elderly) > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                              <Users size={12} /> Elderly
                            </span>
                          )}
                        </div>

                        {v.additional_text && (
                          <div className="mt-3 p-3 rounded-xl bg-[#F5EFE6]/50 text-sm text-[#2D3B2D]/70 italic border border-[#E8DCC4]/30">
                            "{v.additional_text}"
                          </div>
                        )}
                      </div>

                      {/* Footer Badges */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E8DCC4]/30">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            isHighPriority ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {(d.priority_label || v.priority_label || d.priority_level || v.priority_level || 'Normal')}{' '}
                          Priority
                        </span>

                        <span className="rounded-full bg-[#9CAF88]/20 px-3 py-1 text-xs font-bold text-[#2D3B2D] uppercase">
                          {d.status || v.dispatch_status || 'Pending'}
                        </span>

                        <span className="rounded-full bg-[#87CEEB]/20 px-3 py-1 text-xs font-bold text-[#2D3B2D] uppercase">
                          {d.source || v.priority_source || 'System'}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
