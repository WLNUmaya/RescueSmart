import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Radio,
  Phone,
  Mail,
  User,
  MapPinned,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase()
}

function isPendingStatus(status) {
  return normalizeStatus(status) === 'pending'
}

function getDispatchId(dispatch = {}, victim = {}, raw = {}) {
  return (
    dispatch._id ||
    dispatch.id ||
    raw._id ||
    victim.dispatch_id ||
    victim.latest_dispatch_id ||
    victim.current_dispatch_id ||
    null
  )
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

function getVictimEmail(victim = {}) {
  return (
    victim.victim_email ||
    victim.email ||
    victim.email_address ||
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

function PredictionBadge({ value }) {
  const active = Number(value) === 1

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
        active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {active ? 'Yes' : 'No'}
    </span>
  )
}

function TableWrap({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-[#2D3B2D]/50 mb-3">
        {title}
      </div>
      {children}
    </div>
  )
}

function pct(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'N/A'
  return `${(n * 100).toFixed(1)}%`
}

function safeNum(value, fallback = null) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function buildPriorityPredictionRows(predictions = {}) {
  const order = ['Low', 'Moderate', 'Critical']

  return order
    .filter((key) => predictions && Object.prototype.hasOwnProperty.call(predictions, key))
    .map((key) => {
      const item = predictions[key] || {}
      return {
        label: key,
        predicted: Number(item.predicted ?? 0),
        raw_probability: safeNum(item.raw_probability ?? item.probability),
        scaled_probability: safeNum(item.scaled_probability ?? item.probability),
        scaler: safeNum(item.scaler, 1),
        threshold: safeNum(item.threshold),
      }
    })
}

function buildAuthorityPredictionRows(predictions = {}) {
  const order = ['navy', 'fire', 'ambulance', 'police', 'army']

  return order
    .filter((key) => predictions && Object.prototype.hasOwnProperty.call(predictions, key))
    .map((key) => {
      const item = predictions[key] || {}
      return {
        label: key,
        predicted: Number(item.predicted ?? 0),
        probability: safeNum(item.probability),
        threshold: safeNum(item.threshold, 0.5),
        scaler: safeNum(item.scaler),
      }
    })
}

function buildFlagRows(labels = {}, probabilities = {}, thresholds = {}) {
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
    probability: safeNum(probabilities?.[key]),
    threshold: safeNum(thresholds?.[key]),
  }))
}

function pickPredictionSource(victim = {}, dispatch = {}) {
  return {
    priority_predictions:
      victim.priority_predictions || dispatch.priority_predictions || {},
    authority_predictions:
      victim.authority_predictions || dispatch.authority_predictions || {},
    nlp_labels:
      victim.nlp_labels || dispatch.nlp_labels || {},
    nlp_probabilities:
      victim.nlp_probabilities || dispatch.nlp_probabilities || {},
    nlp_thresholds:
      victim.nlp_thresholds || dispatch.nlp_thresholds || {},
  }
}

export default function IncidentReportCard({
  item,
  idx,
  openGoogleDirections,
  respondingDispatchId,
  handleDispatchResponse,
  showActions = true,
}) {
  const d = item.dispatch || {}
  const v = item.victim || {}
  const raw = item.raw || {}
  const coords = extractLatLng(v, d)

  const dispatchId = getDispatchId(d, v, raw)
  const key = dispatchId || d._id || v._id || `${d.victim_id || 'v'}-${idx}`

  const priorityLabel = getPriorityLabel(d, v)
  const priorityText = priorityLabel.toLowerCase()
  const dispatchStatus = d.status || v.dispatch_status || 'Pending'
  const statusLower = normalizeStatus(dispatchStatus)
  const isPending = isPendingStatus(dispatchStatus)
  const responding = respondingDispatchId === dispatchId
  const isHighPriority =
    priorityText.includes('critical') || priorityText.includes('high')

  const victimName = getVictimName(v)
  const victimPhone = getVictimPhone(v)
  const victimEmail = getVictimEmail(v)
  const victimDistrict = getVictimDistrict(v)
  const victimAddress = getVictimAddress(v)

  const [showAiDetails, setShowAiDetails] = useState(false)

  const modelMeta = pickPredictionSource(v, d)
  const priorityPredictionRows = buildPriorityPredictionRows(
    modelMeta.priority_predictions
  )
  const authorityPredictionRows = buildAuthorityPredictionRows(
    modelMeta.authority_predictions
  )
  const nlpFlagRows = buildFlagRows(
    modelMeta.nlp_labels,
    modelMeta.nlp_probabilities,
    modelMeta.nlp_thresholds
  )

  return (
    <motion.div
      key={key}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`rounded-3xl bg-white p-6 shadow-sm border transition-all ${
        isHighPriority ? 'border-red-100 ring-1 ring-red-50' : 'border-[#E8DCC4]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isHighPriority
                ? 'bg-red-100 text-red-600'
                : 'bg-[#F5EFE6] text-[#9CAF88]'
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2D3B2D]/50">
              {isPending ? 'Incident Report' : 'Resolved Report'}
            </div>
            <div className="font-bold text-lg text-[#2D3B2D] truncate">
              {getDisasterLabel(v, d)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              isHighPriority
                ? 'bg-red-100 text-red-700'
                : priorityText.includes('moderate') || priorityText.includes('medium')
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {priorityLabel}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              statusLower === 'accepted'
                ? 'bg-green-100 text-green-700'
                : statusLower === 'rejected'
                ? 'bg-red-100 text-red-700'
                : statusLower === 'timed_out'
                ? 'bg-gray-200 text-gray-700'
                : 'bg-[#9CAF88]/20 text-[#2D3B2D]'
            }`}
          >
            {dispatchStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <div className="rounded-2xl border border-[#E8DCC4]/40 bg-[#F5EFE6]/40 p-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#2D3B2D]/50 mb-2">
            Victim
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2D3B2D] font-semibold">
            <User size={14} className="text-[#9CAF88]" />
            {victimName}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2D3B2D]/75 mt-2">
            <Phone size={14} className="text-[#9CAF88]" />
            {victimPhone}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2D3B2D]/70 mt-2 break-all">
            <Mail size={14} className="text-[#9CAF88]" />
            {victimEmail}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white p-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#2D3B2D]/50 mb-2">
            Location
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2D3B2D]">
            <MapPinned size={14} className="text-[#9CAF88]" />
            {victimDistrict}
          </div>
          {/* <div className="text-sm text-[#2D3B2D]/75 mt-2 break-words">
            {victimAddress}
          </div> */}
          {coords && (
            <div className="text-xs text-[#2D3B2D]/55 mt-2">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white p-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#2D3B2D]/50 mb-2">
            Incident
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2D3B2D]">
            <Clock size={14} className="text-[#9CAF88]" />
            {v.duration_band || 'Unknown'}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2D3B2D]/75 mt-2">
            <Users size={14} className="text-[#9CAF88]" />
            {getAffectedCount(v, d)}
          </div>
          {v.report_id && (
            <div className="text-xs text-[#2D3B2D]/55 mt-2">
              Report ID: {v.report_id}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white p-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#2D3B2D]/50 mb-2">
            Assigned Authority
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2D3B2D]">
            <Radio size={14} className="text-[#9CAF88]" />
            {d.authority_name || 'Unknown'}
          </div>
          <div className="text-sm text-[#2D3B2D]/75 mt-2">
            {d.authority_type || 'N/A'}
          </div>
          {typeof d.distance_km !== 'undefined' && d.distance_km !== null && (
            <div className="text-sm text-[#2D3B2D]/60 mt-2">
              {Number(d.distance_km).toFixed(2)} km away
            </div>
          )}
        </div>
      </div>

      {v.additional_text && (
        <div className="rounded-2xl border border-[#E8DCC4]/40 bg-white p-4 mb-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#2D3B2D]/50 mb-2">
            Victim Message
          </div>
          <p className="text-sm leading-6 text-[#2D3B2D]/80">
            {v.additional_text}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        {coords && (
          <button
            type="button"
            onClick={() =>
              openGoogleDirections({
                lat: coords.lat,
                lng: coords.lng,
              })
            }
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Locate Victim
          </button>
        )}

        {(priorityPredictionRows.length > 0 ||
          authorityPredictionRows.length > 0 ||
          nlpFlagRows.length > 0) && (
          <button
            type="button"
            onClick={() => setShowAiDetails((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCC4]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#2D3B2D]"
          >
            {showAiDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showAiDetails ? 'Hide More Details' : 'View More Details'}
          </button>
        )}
      </div>

      {showAiDetails && (
        <div className="space-y-4 mb-4">
          {priorityPredictionRows.length > 0 && (
            <TableWrap title="Priority Prediction Details">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DCC4]/40 text-left text-[#2D3B2D]/60">
                      <th className="py-2 pr-4 font-semibold">Class</th>
                      <th className="py-2 pr-4 font-semibold">Predicted</th>
                      <th className="py-2 pr-4 font-semibold">Raw Prob.</th>
                      <th className="py-2 pr-4 font-semibold">Scaled Prob.</th>
                      <th className="py-2 pr-4 font-semibold">Scaler</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {priorityPredictionRows.map((row) => (
                      <tr key={row.label} className="border-b border-[#E8DCC4]/20 last:border-0">
                        <td className="py-2 pr-4 font-semibold text-[#2D3B2D]">{row.label}</td>
                        <td className="py-2 pr-4"><PredictionBadge value={row.predicted} /></td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{pct(row.raw_probability)}</td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{pct(row.scaled_probability)}</td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{row.scaler ?? 'N/A'}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableWrap>
          )}

          {authorityPredictionRows.length > 0 && (
            <TableWrap title="Authority Recommendation Details">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DCC4]/40 text-left text-[#2D3B2D]/60">
                      <th className="py-2 pr-4 font-semibold">Authority</th>
                      <th className="py-2 pr-4 font-semibold">Predicted</th>
                      <th className="py-2 pr-4 font-semibold">Probability</th>
                      <th className="py-2 pr-4 font-semibold">Threshold</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {authorityPredictionRows.map((row) => (
                      <tr key={row.label} className="border-b border-[#E8DCC4]/20 last:border-0">
                        <td className="py-2 pr-4 font-semibold text-[#2D3B2D] capitalize">{row.label}</td>
                        <td className="py-2 pr-4"><PredictionBadge value={row.predicted} /></td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{pct(row.probability)}</td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{pct(row.threshold)}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableWrap>
          )}

          {nlpFlagRows.length > 0 && (
            <TableWrap title="Hazard / NLP Flag Details">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DCC4]/40 text-left text-[#2D3B2D]/60">
                      <th className="py-2 pr-4 font-semibold">Flag</th>
                      <th className="py-2 pr-4 font-semibold">Predicted</th>
                      <th className="py-2 pr-4 font-semibold">Probability</th>
                      <th className="py-2 pr-4 font-semibold">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nlpFlagRows.map((row) => (
                      <tr key={row.flag} className="border-b border-[#E8DCC4]/20 last:border-0">
                        <td className="py-2 pr-4 font-semibold text-[#2D3B2D]">
                          {String(row.flag).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())}
                        </td>
                        <td className="py-2 pr-4"><PredictionBadge value={row.predicted} /></td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">{pct(row.probability)}</td>
                        <td className="py-2 pr-4 text-[#2D3B2D]/80">
                          {row.threshold != null ? pct(row.threshold) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableWrap>
          )}
        </div>
      )}

      {showActions && isPending && dispatchId && (
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={responding}
            onClick={() => handleDispatchResponse(dispatchId, 'accepted')}
            className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {responding ? 'Sending...' : 'Accept'}
          </button>

          <button
            type="button"
            disabled={responding}
            onClick={() => handleDispatchResponse(dispatchId, 'rejected')}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {responding ? 'Sending...' : 'Reject'}
          </button>
        </div>
      )}

      {showActions && isPending && !dispatchId && (
        <div className="pt-2">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
            Pending status is shown, but no dispatch id was found for this card.
          </div>
        </div>
      )}
    </motion.div>
  )
}