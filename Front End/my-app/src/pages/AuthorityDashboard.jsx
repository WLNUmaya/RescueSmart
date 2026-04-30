import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  LogOut,
  AlertTriangle,
  MapPin,
  ClipboardList,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import IncidentReportCard from '../components/IncidentReportCard'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:5000'
const SOCKET_URL = API_ORIGIN
const API_BASE = `${API_ORIGIN}/api/v1`
const ITEMS_PER_PAGE = 5

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DUMMY_DISPATCHES = []

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase()
}

function pickBestDispatch(item) {
  const candidates = [
    ...(Array.isArray(item.dispatches) ? item.dispatches : []),
    ...(Array.isArray(item.saved_dispatches) ? item.saved_dispatches : []),
    ...(item.dispatch ? [item.dispatch] : []),
  ].filter(Boolean)

  if (!candidates.length) {
    return item.authority_id || item.authority_type || item.status ? item : {}
  }

  const pending = candidates.find((x) => normalizeStatus(x?.status) === 'pending')
  if (pending) return pending

  return [...candidates].sort((a, b) => {
    const aTime = new Date(a?.created_at || a?.updated_at || 0).getTime() || 0
    const bTime = new Date(b?.created_at || b?.updated_at || 0).getTime() || 0
    return bTime - aTime
  })[0]
}

function normalizeDispatchItem(item) {
  if (!item) return { victim: {}, dispatch: {}, raw: {} }

  if (item.victim || item.dispatch) {
    return {
      victim: item.victim || {},
      dispatch: {
        ...(item.dispatch || {}),
        _id: item.dispatch?._id || item._id || null,
      },
      raw: item,
    }
  }

  const victim = { ...item }
  const dispatch = pickBestDispatch(item)

  return {
    victim,
    dispatch: {
      ...dispatch,
      _id: dispatch?._id || item._id || null,
    },
    raw: item,
  }
}

function extractLatLng(victim = {}, dispatch = {}) {
  const possibleLat = [
    victim.latitude,
    victim.lat,
    victim.victim_latitude,
    victim.location?.lat,
    victim.location?.latitude,
    Array.isArray(victim.location?.coordinates) ? victim.location.coordinates[1] : undefined,
    dispatch.latitude,
    dispatch.lat,
    dispatch.victim_latitude,
    dispatch.location?.lat,
    dispatch.location?.latitude,
    Array.isArray(dispatch.location?.coordinates) ? dispatch.location.coordinates[1] : undefined,
  ]

  const possibleLng = [
    victim.longitude,
    victim.lng,
    victim.lon,
    victim.victim_longitude,
    victim.location?.lng,
    victim.location?.lon,
    victim.location?.longitude,
    Array.isArray(victim.location?.coordinates) ? victim.location.coordinates[0] : undefined,
    dispatch.longitude,
    dispatch.lng,
    dispatch.lon,
    dispatch.victim_longitude,
    dispatch.location?.lng,
    dispatch.location?.lon,
    dispatch.location?.longitude,
    Array.isArray(dispatch.location?.coordinates) ? dispatch.location.coordinates[0] : undefined,
  ]

  const lat = possibleLat.find((v) => v !== undefined && v !== null && v !== '')
  const lng = possibleLng.find((v) => v !== undefined && v !== null && v !== '')

  const latNum = Number(lat)
  const lngNum = Number(lng)

  const valid =
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180

  if (!valid) return null

  return { lat: latNum, lng: lngNum }
}

function FitBounds({ markers, currentLocation }) {
  const map = useMap()

  useEffect(() => {
    const points = markers.map((m) => [m.lat, m.lng])

    if (currentLocation) {
      points.push([currentLocation.lat, currentLocation.lng])
    }

    if (!points.length) return

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [markers, currentLocation, map])

  return null
}

function getPriorityLabel(dispatch = {}, victim = {}) {
  return (
    dispatch.priority_label ||
    victim.priority_label ||
    (dispatch.priority_level === 2 ? 'Critical' : null) ||
    (dispatch.priority_level === 1 ? 'Moderate' : null) ||
    (dispatch.priority_level === 0 ? 'Low' : null) ||
    (victim.priority_level === 2 ? 'Critical' : null) ||
    (victim.priority_level === 1 ? 'Moderate' : null) ||
    (victim.priority_level === 0 ? 'Low' : null) ||
    'Unknown'
  )
}

function getPriorityBucket(item) {
  const label = getPriorityLabel(item?.dispatch, item?.victim).toLowerCase()

  if (label.includes('critical') || label.includes('high')) return 'high'
  if (label.includes('moderate') || label.includes('medium')) return 'medium'
  if (label.includes('low')) return 'low'
  return 'unknown'
}

function getReadableError(err, fallback) {
  if (err?.message) return err.message
  return fallback
}

function sortDispatches(list) {
  return [...list].sort((a, b) => {
    const aStatus = normalizeStatus(a?.dispatch?.status || a?.victim?.dispatch_status)
    const bStatus = normalizeStatus(b?.dispatch?.status || b?.victim?.dispatch_status)

    const aPendingRank = aStatus === 'pending' ? 0 : 1
    const bPendingRank = bStatus === 'pending' ? 0 : 1

    if (aPendingRank !== bPendingRank) return aPendingRank - bPendingRank

    const aTime =
      new Date(
        a?.dispatch?.created_at ||
          a?.victim?.created_at ||
          a?.dispatch?.updated_at ||
          0
      ).getTime() || 0

    const bTime =
      new Date(
        b?.dispatch?.created_at ||
          b?.victim?.created_at ||
          b?.dispatch?.updated_at ||
          0
      ).getTime() || 0

    return bTime - aTime
  })
}

function getVictimName(victim = {}) {
  return (
    victim.victim_name ||
    victim.full_name ||
    victim.name ||
    victim.victim_full_name ||
    'Unknown'
  )
}

function getVictimPhone(victim = {}) {
  return (
    victim.victim_phone ||
    victim.phone ||
    victim.mobile ||
    victim.contact_number ||
    'Unknown'
  )
}

function getVictimDistrict(victim = {}) {
  return (
    victim.victim_district ||
    victim.district ||
    victim.area_type ||
    'Unknown'
  )
}

function getVictimAddress(victim = {}) {
  if (victim.resolved_address) return victim.resolved_address
  if (victim.original_address) return victim.original_address
  if (victim.address) return victim.address

  if (
    victim.location &&
    Array.isArray(victim.location.coordinates) &&
    victim.location.coordinates.length === 2
  ) {
    const lng = Number(victim.location.coordinates[0])
    const lat = Number(victim.location.coordinates[1])

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  return 'Unknown'
}

function getAffectedCount(victim = {}, dispatch = {}) {
  return (
    victim.affected_victim_count ??
    victim.affected_count ??
    victim.victim_count ??
    victim.victim_count_band ??
    victim.num_people ??
    dispatch.num_people ??
    'Unknown'
  )
}

function getDisasterLabel(victim = {}, dispatch = {}) {
  return (
    victim.disaster_type ||
    victim.incident_type ||
    victim.emergency_type ||
    dispatch.authority_type ||
    'Unknown Incident'
  )
}

function DotPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-6 pt-8">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1
          const active = page === currentPage

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-3 w-3 rounded-full transition-all ${
                active ? 'bg-blue-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${page}`}
            />
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default function AuthorityDashboard() {
  const navigate = useNavigate()
  const socketRef = useRef(null)

  const authority = useMemo(() => {
    const raw = localStorage.getItem('authority')
    try {
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!authority?.authority_id) {
      navigate('/authority/login')
    }
  }, [authority, navigate])

  const authorityRoomId = authority?.authority_id

  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [respondingDispatchId, setRespondingDispatchId] = useState(null)
  const [activeTab, setActiveTab] = useState('active')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activePage, setActivePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)

  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.error('Failed to get live location:', error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const fetchDispatches = useCallback(
    async ({ silent = false } = {}) => {
      if (!authorityRoomId) return

      try {
        if (!silent) setLoading(true)
        else setRefreshing(true)

        const res = await fetch(`${API_BASE}/dispatches/authority/${authorityRoomId}`)
        if (!res.ok) {
          throw new Error(`Failed to load dispatches (${res.status})`)
        }

        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        const normalized = list.map(normalizeDispatchItem)
        setDispatches(sortDispatches(normalized))
      } catch (err) {
        console.error('Failed to load dispatches:', err)
        if (!silent) setDispatches(DUMMY_DISPATCHES)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [authorityRoomId]
  )

  useEffect(() => {
    if (!authorityRoomId) return
    fetchDispatches()
  }, [authorityRoomId, fetchDispatches])

  useEffect(() => {
    if (!authorityRoomId) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      socket.emit('join_authority', { authority_id: authorityRoomId })
      fetchDispatches({ silent: true })
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
    })

    socket.on('reconnect', () => {
      socket.emit('join_authority', { authority_id: authorityRoomId })
      fetchDispatches({ silent: true })
    })

    socket.on('new_dispatch', async (payload) => {
      console.log('new_dispatch received:', payload)

      const targetAuthorityId = payload?.authority_id || payload?.dispatch?.authority_id
      if (targetAuthorityId && String(targetAuthorityId) !== String(authorityRoomId)) {
        return
      }

      await fetchDispatches({ silent: true })
    })

    return () => {
      try {
        socket.emit('leave_authority', { authority_id: authorityRoomId })
      } catch (e) {
        console.error('leave_authority error:', e)
      }
      socket.disconnect()
    }
  }, [authorityRoomId, fetchDispatches])

  useEffect(() => {
    if (!authorityRoomId || socketConnected) return

    const intervalId = setInterval(() => {
      fetchDispatches({ silent: true })
    }, 15000)

    return () => clearInterval(intervalId)
  }, [authorityRoomId, socketConnected, fetchDispatches])

  async function handleDispatchResponse(dispatchId, responseStatus) {
    try {
      setRespondingDispatchId(dispatchId)

      const res = await fetch(`${API_BASE}/dispatches/${dispatchId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response_status: responseStatus,
        }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.details ||
            `Failed to ${responseStatus} dispatch (${res.status})`
        )
      }

      await fetchDispatches({ silent: true })
    } catch (err) {
      console.error(`Failed to ${responseStatus} dispatch:`, err)

      const fallback =
        err instanceof TypeError
          ? 'Request failed. Check backend server, CORS, and VITE_API_ORIGIN.'
          : `Failed to ${responseStatus} dispatch`

      alert(getReadableError(err, fallback))
    } finally {
      setRespondingDispatchId(null)
    }
  }

  function handleLogout() {
    localStorage.removeItem('authority')
    navigate('/authority/login')
  }

  function openGoogleDirections(marker) {
    const destination = `${marker.lat},${marker.lng}`

    if (currentLocation) {
      const origin = `${currentLocation.lat},${currentLocation.lng}`
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
        '_blank'
      )
      return
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`,
      '_blank'
    )
  }

  const displayDispatches = useMemo(() => {
    return dispatches.length > 0 ? dispatches : DUMMY_DISPATCHES
  }, [dispatches])

  const activeDispatches = useMemo(() => {
    return displayDispatches.filter((item) => {
      const status = normalizeStatus(item?.dispatch?.status || item?.victim?.dispatch_status)
      return status === 'pending'
    })
  }, [displayDispatches])

  const resolvedDispatches = useMemo(() => {
    return displayDispatches.filter((item) => {
      const status = normalizeStatus(item?.dispatch?.status || item?.victim?.dispatch_status)
      return status !== 'pending'
    })
  }, [displayDispatches])

  const filteredActiveDispatches = useMemo(() => {
    if (priorityFilter === 'all') return activeDispatches
    return activeDispatches.filter((item) => getPriorityBucket(item) === priorityFilter)
  }, [activeDispatches, priorityFilter])

  const filteredResolvedDispatches = useMemo(() => {
    if (priorityFilter === 'all') return resolvedDispatches
    return resolvedDispatches.filter((item) => getPriorityBucket(item) === priorityFilter)
  }, [resolvedDispatches, priorityFilter])

  useEffect(() => {
    setActivePage(1)
  }, [activeDispatches.length])

  useEffect(() => {
    setHistoryPage(1)
  }, [resolvedDispatches.length])

  useEffect(() => {
    setActivePage(1)
    setHistoryPage(1)
  }, [priorityFilter, activeTab])

  const stats = useMemo(() => {
    const high = activeDispatches.filter((x) => {
      const label = getPriorityLabel(x?.dispatch, x?.victim).toLowerCase()
      return label.includes('critical') || label.includes('high')
    }).length

    const medium = activeDispatches.filter((x) => {
      const label = getPriorityLabel(x?.dispatch, x?.victim).toLowerCase()
      return label.includes('moderate') || label.includes('medium')
    }).length

    return {
      total: activeDispatches.length,
      high,
      medium,
      resolved: resolvedDispatches.length,
    }
  }, [activeDispatches, resolvedDispatches])

  const mapMarkers = useMemo(() => {
    return displayDispatches
      .map((item, idx) => {
        const victim = item.victim || {}
        const dispatch = item.dispatch || {}
        const coords = extractLatLng(victim, dispatch)

        if (!coords) return null

        return {
          id: dispatch._id || victim._id || `${dispatch.victim_id || 'marker'}-${idx}`,
          lat: coords.lat,
          lng: coords.lng,
          disasterType: getDisasterLabel(victim, dispatch),
          priorityLabel: getPriorityLabel(dispatch, victim),
          area: getVictimDistrict(victim),
          address: getVictimAddress(victim),
          victimName: getVictimName(victim),
          victimPhone: getVictimPhone(victim),
          status: dispatch.status || victim.dispatch_status || 'Pending',
          affectedCount: getAffectedCount(victim),
          reportId: victim.report_id || 'Unknown',
          authorityName: dispatch.authority_name || 'Unknown',
          authorityType: dispatch.authority_type || 'Unknown',
          distanceKm: dispatch.distance_km,
          text: victim.additional_text || '',
        }
      })
      .filter(Boolean)
  }, [displayDispatches])

  const activeTotalPages = Math.max(1, Math.ceil(filteredActiveDispatches.length / ITEMS_PER_PAGE))
  const historyTotalPages = Math.max(1, Math.ceil(filteredResolvedDispatches.length / ITEMS_PER_PAGE))

  const pagedActiveDispatches = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE
    return filteredActiveDispatches.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredActiveDispatches, activePage])

  const pagedResolvedDispatches = useMemo(() => {
    const start = (historyPage - 1) * ITEMS_PER_PAGE
    return filteredResolvedDispatches.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredResolvedDispatches, historyPage])

  const currentTabItems =
    activeTab === 'active' ? pagedActiveDispatches : pagedResolvedDispatches
  const totalPages = activeTab === 'active' ? activeTotalPages : historyTotalPages

  function handlePageChange(page) {
    const safePage = Math.max(1, Math.min(page, totalPages))

    if (activeTab === 'active') setActivePage(safePage)
    else setHistoryPage(safePage)
  }

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
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold">
                {socketConnected ? 'Live' : 'Polling'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#E8DCC4]/60 px-4 py-2 text-sm font-semibold hover:bg-[#F5EFE6]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-3xl bg-white p-5 border border-[#E8DCC4]/50 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-[#2D3B2D]/50 font-bold mb-2">
              Active Incidents
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-[#E8DCC4]/50 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-[#2D3B2D]/50 font-bold mb-2">
              Critical / High
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.high}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-[#E8DCC4]/50 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-[#2D3B2D]/50 font-bold mb-2">
              Moderate
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.medium}</div>
          </div>

          <div className="rounded-3xl bg-white p-5 border border-[#E8DCC4]/50 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-[#2D3B2D]/50 font-bold mb-2">
              Resolved
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[#E8DCC4]/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E8DCC4]/40">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Live Incident Map</h2>
                <p className="text-sm text-[#2D3B2D]/60 mt-1">
                  Active and resolved reports with victim locations.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Incident
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Current Location
                </div>
              </div>
            </div>
          </div>

          <div className="h-[420px]">
            <MapContainer
              center={[7.8731, 80.7718]}
              zoom={8}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={redIcon}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <div className="font-bold">{marker.disasterType}</div>
                      <div>Victim: {marker.victimName}</div>
                      <div>Phone: {marker.victimPhone}</div>
                      <div>Area: {marker.area}</div>
                      <div>Priority: {marker.priorityLabel}</div>
                      <div>Status: {marker.status}</div>
                      <div>Affected: {marker.affectedCount}</div>
                      <div>Authority: {marker.authorityName}</div>
                      {marker.distanceKm != null && (
                        <div>Distance: {Number(marker.distanceKm).toFixed(2)} km</div>
                      )}
                      {marker.text && <div>Message: {marker.text}</div>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {currentLocation && (
                <Marker
                  position={[currentLocation.lat, currentLocation.lng]}
                  icon={blueIcon}
                >
                  <Popup>Your current location</Popup>
                </Marker>
              )}

              <FitBounds markers={mapMarkers} currentLocation={currentLocation} />
            </MapContainer>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-[#E8DCC4]/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E8DCC4]/40">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Incident Reports</h2>
                <p className="text-sm text-[#2D3B2D]/60 mt-1">
                  Review active incidents and response history.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                    activeTab === 'active'
                      ? 'bg-[#9CAF88] text-white'
                      : 'bg-[#F5EFE6] text-[#2D3B2D]'
                  }`}
                >
                  <ClipboardList size={16} />
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                    activeTab === 'history'
                      ? 'bg-[#9CAF88] text-white'
                      : 'bg-[#F5EFE6] text-[#2D3B2D]'
                  }`}
                >
                  <History size={16} />
                  History
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { key: 'all', label: 'All' },
                { key: 'high', label: 'Critical / High' },
                { key: 'medium', label: 'Moderate' },
                { key: 'low', label: 'Low' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setPriorityFilter(filter.key)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${
                    priorityFilter === filter.key
                      ? 'bg-[#87CEEB] text-[#2D3B2D]'
                      : 'bg-[#F5EFE6] text-[#2D3B2D]/70'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="py-16 text-center text-[#2D3B2D]/60">
                Loading reports...
              </div>
            ) : currentTabItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#F5EFE6] text-[#9CAF88] mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold">No reports found</h3>
                <p className="text-sm text-[#2D3B2D]/60 mt-1">
                  There are no reports in this category right now.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {currentTabItems.map((item, idx) => (
                      <IncidentReportCard
                        key={(item?.dispatch?._id || item?.victim?._id || idx) + activeTab}
                        item={item}
                        idx={idx}
                        openGoogleDirections={openGoogleDirections}
                        respondingDispatchId={respondingDispatchId}
                        handleDispatchResponse={handleDispatchResponse}
                        showActions={activeTab === 'active'}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <DotPagination
                  currentPage={activeTab === 'active' ? activePage : historyPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </section>

        {refreshing && (
          <div className="fixed bottom-4 right-4 rounded-full bg-white border border-[#E8DCC4]/60 shadow-lg px-4 py-2 text-sm font-semibold">
            Refreshing...
          </div>
        )}
      </main>
    </div>
  )
}