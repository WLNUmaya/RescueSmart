
// // // import React, { useMemo, useState } from 'react'
// // // import { motion, AnimatePresence } from 'framer-motion'
// // // import {
// // //   Droplets,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   Check,
// // //   MapPin,
// // //   AlertTriangle,
// // //   Users,
// // //   Activity,
// // //   Clock,
// // //   FileText,
// // //   ShieldAlert,
// // // } from 'lucide-react'
// // // import { submitVictim } from '../api/api'
// // // import { useNavigate } from 'react-router-dom'

// // // /* -------------------- CONSTANTS -------------------- */
// // // const DISASTERS = ['Flood', 'Tsunami', 'Cyclone', 'Landslide', 'Fire', 'Other', 'Unknown']
// // // const RISK = ['Low', 'Medium', 'High', 'Unknown']
// // // const AREA = ['Urban', 'Rural', 'Unknown']
// // // const DURATION = ['<1-6h', '6-24h', '>24h', 'Unknown']

// // // const VICTIM_BANDS = [
// // //   { label: '1 person', value: 'C1' },
// // //   { label: '2–5 people', value: 'C2_5' },
// // //   { label: '6–10 people', value: 'C6_10' },
// // //   { label: '10+ people', value: 'C10PLUS' },
// // //   { label: 'Not sure', value: 'CUNKNOWN' },
// // // ]

// // // /* -------------------- COMPONENTS -------------------- */
// // // const cn = (...xs) => xs.filter(Boolean).join(' ')

// // // const Chip = ({ active, onClick, children }) => (
// // //   <motion.button
// // //     type="button"
// // //     onClick={onClick}
// // //     whileHover={{ scale: 1.02 }}
// // //     whileTap={{ scale: 0.98 }}
// // //     className={cn(
// // //       'relative w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 border shadow-sm',
// // //       active
// // //         ? 'border-[#9CAF88] bg-[#9CAF88] text-white shadow-md'
// // //         : 'border-[#E8DCC4] bg-white/60 text-[#2D3B2D] hover:bg-white hover:border-[#9CAF88]/50',
// // //     )}
// // //   >
// // //     {children}
// // //     {active && (
// // //       <motion.div
// // //         initial={{ scale: 0 }}
// // //         animate={{ scale: 1 }}
// // //         className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-0.5"
// // //       >
// // //         <Check size={12} strokeWidth={3} />
// // //       </motion.div>
// // //     )}
// // //   </motion.button>
// // // )

// // // const ToggleRow = ({ label, desc, value, onChange }) => (
// // //   <div className="flex items-center justify-between gap-6 py-4 border-b border-[#E8DCC4]/30 last:border-0">
// // //     <div>
// // //       <div className="text-base font-semibold text-[#2D3B2D]">{label}</div>
// // //       {desc && <div className="text-sm text-[#2D3B2D]/60 mt-0.5">{desc}</div>}
// // //     </div>
// // //     <button
// // //       type="button"
// // //       onClick={() => onChange(value ? 0 : 1)}
// // //       className={cn(
// // //         'relative h-8 w-14 rounded-full p-1 transition-colors duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#9CAF88]/50',
// // //         value ? 'bg-[#9CAF88]' : 'bg-[#E8DCC4]',
// // //       )}
// // //       aria-label={label}
// // //     >
// // //       <motion.div
// // //         className="h-6 w-6 rounded-full bg-white shadow-sm"
// // //         animate={{ x: value ? 24 : 0 }}
// // //         transition={{ type: 'spring', stiffness: 500, damping: 30 }}
// // //       />
// // //     </button>
// // //   </div>
// // // )

// // // function QuestionBlock({ title, hint, icon: Icon, children }) {
// // //   return (
// // //     <motion.div
// // //       initial={{ opacity: 0, y: 10 }}
// // //       animate={{ opacity: 1, y: 0 }}
// // //       className="rounded-3xl border border-[#E8DCC4]/50 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm space-y-5"
// // //     >
// // //       <div className="flex items-start gap-3">
// // //         {Icon && (
// // //           <div className="p-2 rounded-xl bg-[#F5EFE6] text-[#9CAF88]">
// // //             <Icon size={20} />
// // //           </div>
// // //         )}
// // //         <div>
// // //           <div className="text-lg font-bold text-[#2D3B2D]">{title}</div>
// // //           {hint && <div className="text-sm text-[#2D3B2D]/60 mt-1">{hint}</div>}
// // //         </div>
// // //       </div>
// // //       {children}
// // //     </motion.div>
// // //   )
// // // }

// // // const Stat = ({ label, value, icon: Icon }) => (
// // //   <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5EFE6]/50 border border-[#E8DCC4]/30">
// // //     {Icon && <Icon size={16} className="mt-0.5 text-[#9CAF88]" />}
// // //     <div>
// // //       <div className="text-xs font-medium text-[#2D3B2D]/50 uppercase tracking-wider">{label}</div>
// // //       <div className="text-sm font-semibold text-[#2D3B2D] mt-0.5 break-words">{value}</div>
// // //     </div>
// // //   </div>
// // // )

// // // const Badge = ({ children }) => (
// // //   <span className="inline-flex items-center rounded-full bg-[#E8DCC4] text-[#2D3B2D] px-3 py-1 text-xs font-bold uppercase tracking-wide">
// // //     {children}
// // //   </span>
// // // )

// // // /* -------------------- MAIN -------------------- */
// // // export default function VictimWizard() {
// // //   const [step, setStep] = useState(1)
// // //   const totalSteps = 4
// // //   const [submitting, setSubmitting] = useState(false)
// // //   const [error, setError] = useState('')
// // //   const [result, setResult] = useState(null)

// // //   let navigate = (path) => console.log('Navigate to:', path)
// // //   try {
// // //     navigate = useNavigate()
// // //   } catch (e) {}

// // //   const [form, setForm] = useState({
// // //     disaster_type: 'Unknown',
// // //     area_risk_level: 'Unknown',
// // //     area_type: 'Unknown',
// // //     duration_band: 'Unknown',
// // //     victim_count_band: 'CUNKNOWN',
// // //     children: 0,
// // //     elderly: 0,
// // //     pregnant: 0,
// // //     disability: 0,
// // //     chronic_illness: 0,
// // //     health_issue_6h: 0,
// // //     trapped: 0,
// // //     fire_smoke: 0,
// // //     water_rising: 0,
// // //     medical_emergency: 0,
// // //     additional_text: '',
// // //     location: null, 
// // //   })

// // //   const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

// // //   const detectLocation = () => {
// // //     if (!navigator.geolocation) {
// // //       alert('Geolocation is not supported by your browser')
// // //       return
// // //     }
// // //     navigator.geolocation.getCurrentPosition(
// // //       (position) => {
// // //         const { latitude, longitude } = position.coords
// // //         setField('location', { lat: latitude, lng: longitude })
// // //       },
// // //       (err) => {
// // //         console.error(err)
// // //         alert('Could not detect location. Please enable GPS/location.')
// // //       },
// // //     )
// // //   }

// // //   const canNext = useMemo(() => {
// // //     if (step === 1) return true
// // //     if (step === 2) return Boolean(form.victim_count_band)
// // //     if (step === 3) return true
// // //     if (step === 4) return true
// // //     return true
// // //   }, [step, form])

// // //   const progressPct = Math.round((step / totalSteps) * 100)

// // //   async function submitAll() {
// // //     setSubmitting(true)
// // //     setError('')
// // //     setResult(null)
// // //     try {
// // //       const payload = {
// // //         disaster_type: form.disaster_type,
// // //         area_risk_level: form.area_risk_level,
// // //         area_type: form.area_type,
// // //         duration_band: form.duration_band,
// // //         victim_count_band: form.victim_count_band,
// // //         children: Number(form.children),
// // //         elderly: Number(form.elderly),
// // //         pregnant: Number(form.pregnant),
// // //         disability: Number(form.disability),
// // //         chronic_illness: Number(form.chronic_illness),
// // //         health_issue_6h: Number(form.health_issue_6h),
// // //         latitude: form.location?.lat ?? null,
// // //         longitude: form.location?.lng ?? null,
// // //         additional_text: form.additional_text,
// // //         trapped: Number(form.trapped),
// // //         fire_smoke: Number(form.fire_smoke),
// // //         water_rising: Number(form.water_rising),
// // //         medical_emergency: Number(form.medical_emergency),
// // //       }

// // //       const res = await submitVictim(payload)
// // //       setResult({
// // //         victim_id: res._id || res.id,
// // //         priority_level: res.priority_level,
// // //         authorities: res.authorities,
// // //       })
// // //     } catch (e) {
// // //       setError(String(e?.message || e))
// // //     } finally {
// // //       setSubmitting(false)
// // //     }
// // //   }

// // //   const stepInfo = useMemo(() => {
// // //     switch (step) {
// // //       case 1:
// // //         return { title: 'Basic Details', subtitle: 'Select what you know. Unknown is allowed.' }
// // //       case 2:
// // //         return { title: 'People & Danger', subtitle: 'Approximate the number of affected people.' }
// // //       case 3:
// // //         return { title: 'Vulnerability Check', subtitle: 'These factors increase urgency and response type.' }
// // //       case 4:
// // //         return { title: 'Final Details', subtitle: 'Add time + short message, then submit.' }
// // //       default:
// // //         return { title: '', subtitle: '' }
// // //     }
// // //   }, [step])

// // //   const prettyVictimBand =
// // //     VICTIM_BANDS.find((b) => b.value === form.victim_count_band)?.label || form.victim_count_band

// // //   return (
// // //     <div className="min-h-screen bg-[#F5EFE6] text-[#2D3B2D] font-sans selection:bg-[#9CAF88] selection:text-white">
// // //       {/* Header */}
// // //       <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8DCC4]/50">
// // //         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
// // //           <div className="flex items-center gap-3">
// // //             <div className="bg-[#87CEEB] p-2 rounded-full text-white">
// // //               <Droplets size={20} fill="currentColor" />
// // //             </div>
// // //             <div>
// // //               <div className="text-xs font-bold text-[#9CAF88] tracking-wider uppercase">RescueSmart</div>
// // //               <h1 className="text-lg font-bold text-[#2D3B2D] leading-none">Emergency Rescue</h1>
// // //             </div>
// // //           </div>
// // //           <div className="flex items-center gap-4">
// // //             <div className="hidden sm:block">
// // //               <Badge>
// // //                 Step {step}/{totalSteps}
// // //               </Badge>
// // //             </div>
// // //             <button
// // //               onClick={() => navigate('/')}
// // //               className="px-4 py-2 rounded-full border border-[#E8DCC4] hover:bg-[#F5EFE6] font-semibold text-sm text-[#2D3B2D] transition-colors"
// // //             >
// // //               Exit
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </header>

// // //       {/* Main Layout */}
// // //       <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
// // //         {/* LEFT */}
// // //         <section className="lg:col-span-2 space-y-6">
// // //           {/* Progress Header */}
// // //           <div className="rounded-3xl border border-[#E8DCC4]/50 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
// // //             <div className="flex items-end justify-between gap-4 mb-6">
// // //               <div>
// // //                 <motion.div
// // //                   key={step}
// // //                   initial={{ opacity: 0, y: 5 }}
// // //                   animate={{ opacity: 1, y: 0 }}
// // //                   className="text-sm font-bold text-[#9CAF88] uppercase tracking-wider mb-1"
// // //                 >
// // //                   {stepInfo.title}
// // //                 </motion.div>
// // //                 <motion.div
// // //                   key={`sub-${step}`}
// // //                   initial={{ opacity: 0 }}
// // //                   animate={{ opacity: 1 }}
// // //                   className="text-xl sm:text-2xl font-bold text-[#2D3B2D]"
// // //                 >
// // //                   {stepInfo.subtitle}
// // //                 </motion.div>
// // //               </div>
// // //               <div className="text-2xl font-bold text-[#9CAF88]/40">{progressPct}%</div>
// // //             </div>

// // //             <div className="h-3 w-full rounded-full bg-[#F5EFE6] overflow-hidden">
// // //               <motion.div
// // //                 className="h-full bg-[#9CAF88]"
// // //                 initial={{ width: 0 }}
// // //                 animate={{ width: `${(step / totalSteps) * 100}%` }}
// // //                 transition={{ type: 'spring', stiffness: 100, damping: 20 }}
// // //               />
// // //             </div>
// // //           </div>

// // //           {/* Steps */}
// // //           <AnimatePresence mode="wait">
// // //             <motion.div
// // //               key={step}
// // //               initial={{ opacity: 0, x: 20 }}
// // //               animate={{ opacity: 1, x: 0 }}
// // //               exit={{ opacity: 0, x: -20 }}
// // //               transition={{ duration: 0.3 }}
// // //               className="space-y-6"
// // //             >
// // //               {step === 1 && (
// // //                 <>
// // //                   <QuestionBlock title="What disaster is happening?" hint="Select the closest option." icon={AlertTriangle}>
// // //                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
// // //                       {DISASTERS.map((d) => (
// // //                         <Chip key={d} active={form.disaster_type === d} onClick={() => setField('disaster_type', d)}>
// // //                           {d}
// // //                         </Chip>
// // //                       ))}
// // //                     </div>
// // //                   </QuestionBlock>

// // //                   <QuestionBlock title="Your Location" hint="Detect GPS to find nearest authorities." icon={MapPin}>
// // //                     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[#F5EFE6] p-4 rounded-2xl">
// // //                       <button
// // //                         type="button"
// // //                         onClick={detectLocation}
// // //                         className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5BA4C9] text-white font-bold shadow-md hover:bg-[#4A93B8] transition-all active:scale-95 flex items-center justify-center gap-2"
// // //                       >
// // //                         <MapPin size={18} />
// // //                         Detect Location
// // //                       </button>
// // //                       <div className="text-sm text-[#2D3B2D]/70">
// // //                         {form.location ? (
// // //                           <div className="flex flex-col">
// // //                             <span className="font-semibold text-[#2D3B2D]">Location Acquired</span>
// // //                             <span className="font-mono text-xs">
// // //                               {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
// // //                             </span>
// // //                           </div>
// // //                         ) : (
// // //                           <span>GPS not detected yet </span>
// // //                         )}
// // //                       </div>
// // //                     </div>
// // //                   </QuestionBlock>

// // //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //                     <QuestionBlock title="Area Danger Level" hint="High = life-threatening." icon={ShieldAlert}>
// // //                       <div className="grid grid-cols-2 gap-3">
// // //                         {RISK.map((r) => (
// // //                           <Chip key={r} active={form.area_risk_level === r} onClick={() => setField('area_risk_level', r)}>
// // //                             {r}
// // //                           </Chip>
// // //                         ))}
// // //                       </div>
// // //                     </QuestionBlock>

// // //                     <QuestionBlock title="Area Type" hint="Urban = city, Rural = village" icon={MapPin}>
// // //                       <div className="grid grid-cols-2 gap-3">
// // //                         {AREA.map((a) => (
// // //                           <Chip key={a} active={form.area_type === a} onClick={() => setField('area_type', a)}>
// // //                             {a}
// // //                           </Chip>
// // //                         ))}
// // //                       </div>
// // //                     </QuestionBlock>
// // //                   </div>
// // //                 </>
// // //               )}

// // //               {step === 2 && (
// // //                 <QuestionBlock title="How many people need help?" hint="Choose the closest option." icon={Users}>
// // //                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// // //                     {VICTIM_BANDS.map((b) => (
// // //                       <Chip key={b.value} active={form.victim_count_band === b.value} onClick={() => setField('victim_count_band', b.value)}>
// // //                         {b.label}
// // //                       </Chip>
// // //                     ))}
// // //                   </div>
// // //                 </QuestionBlock>
// // //               )}

// // //               {step === 3 && (
// // //                 <QuestionBlock title="Vulnerability Check" hint="Turn ON only if YES. Helps prioritize medical aid." icon={Activity}>
// // //                   <div className="divide-y divide-[#E8DCC4]/30">
// // //                     <ToggleRow label="Children present" desc="Under 18 years" value={form.children} onChange={(v) => setField('children', v)} />
// // //                     <ToggleRow label="Elderly present" desc="Above 60 years" value={form.elderly} onChange={(v) => setField('elderly', v)} />
// // //                     <ToggleRow label="Pregnant person" desc="May require faster medical response" value={form.pregnant} onChange={(v) => setField('pregnant', v)} />
// // //                     <ToggleRow label="Disability" desc="Mobility/vision/hearing limitations" value={form.disability} onChange={(v) => setField('disability', v)} />
// // //                     <ToggleRow label="Chronic illness" desc="Asthma, heart condition, diabetes, etc." value={form.chronic_illness} onChange={(v) => setField('chronic_illness', v)} />
// // //                     <ToggleRow label="Health issue (last 6h)" desc="Breathing issues, unconscious, bleeding" value={form.health_issue_6h} onChange={(v) => setField('health_issue_6h', v)} />
// // //                   </div>
// // //                 </QuestionBlock>
// // //               )}

// // //               {step === 4 && (
// // //                 <>
// // //                   <QuestionBlock title="Duration" hint="How long has this been happening?" icon={Clock}>
// // //                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
// // //                       {DURATION.map((d) => (
// // //                         <Chip key={d} active={form.duration_band === d} onClick={() => setField('duration_band', d)}>
// // //                           {d}
// // //                         </Chip>
// // //                       ))}
// // //                     </div>
// // //                   </QuestionBlock>

// // //                   <QuestionBlock
// // //                     title="Describe the situation"
// // //                     hint="Details help rescuers prepare (e.g., 'Trapped on roof', 'Water rising fast')"
// // //                     icon={FileText}
// // //                   >
// // //                     <textarea
// // //                       className="w-full rounded-2xl border border-[#E8DCC4] bg-[#F5EFE6]/30 p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all min-h-[150px] resize-y"
// // //                       placeholder="Type what happened..."
// // //                       value={form.additional_text}
// // //                       onChange={(e) => setField('additional_text', e.target.value)}
// // //                     />
// // //                   </QuestionBlock>
// // //                 </>
// // //               )}
// // //             </motion.div>
// // //           </AnimatePresence>

// // //           {/* Action Bar */}
// // //           <div className="rounded-3xl border border-[#E8DCC4]/50 bg-white p-6 flex flex-col sm:flex-row gap-4 shadow-sm mt-8">
// // //             <button
// // //               onClick={() => setStep((s) => Math.max(1, s - 1))}
// // //               disabled={step === 1 || submitting}
// // //               className={cn(
// // //                 'w-full sm:w-auto px-8 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2',
// // //                 step === 1 || submitting
// // //                   ? 'bg-[#F5EFE6] text-[#2D3B2D]/40 cursor-not-allowed'
// // //                   : 'bg-white border-2 border-[#E8DCC4] text-[#2D3B2D] hover:bg-[#F5EFE6]',
// // //               )}
// // //             >
// // //               <ChevronLeft size={20} />
// // //               Back
// // //             </button>

// // //             {step < totalSteps ? (
// // //               <button
// // //                 onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
// // //                 disabled={!canNext || submitting}
// // //                 className={cn(
// // //                   'flex-1 py-3 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2',
// // //                   !canNext || submitting
// // //                     ? 'bg-[#E8DCC4] text-[#2D3B2D]/50 cursor-not-allowed'
// // //                     : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] hover:shadow-lg active:scale-95',
// // //                 )}
// // //               >
// // //                 Next Step
// // //                 <ChevronRight size={20} />
// // //               </button>
// // //             ) : (
// // //               <button
// // //                 onClick={submitAll}
// // //                 disabled={submitting}
// // //                 className={cn(
// // //                   'flex-1 py-3 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2',
// // //                   submitting ? 'bg-[#9CAF88]/70 text-white cursor-wait' : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] hover:shadow-lg active:scale-95',
// // //                 )}
// // //               >
// // //                 {submitting ? (
// // //                   <>Processing...</>
// // //                 ) : (
// // //                   <>
// // //                     Submit Report <Check size={20} />
// // //                   </>
// // //                 )}
// // //               </button>
// // //             )}
// // //           </div>

// // //           {/* Messages */}
// // //           <AnimatePresence>
// // //             {error && (
// // //               <motion.div
// // //                 initial={{ opacity: 0, y: 10 }}
// // //                 animate={{ opacity: 1, y: 0 }}
// // //                 exit={{ opacity: 0 }}
// // //                 className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 flex items-start gap-3"
// // //               >
// // //                 <AlertTriangle className="shrink-0 mt-0.5" />
// // //                 <div>
// // //                   <div className="font-bold">Submission Error</div>
// // //                   <div>{error}</div>
// // //                 </div>
// // //               </motion.div>
// // //             )}

// // //             {result && (
// // //               <motion.div
// // //                 initial={{ opacity: 0, y: 10 }}
// // //                 animate={{ opacity: 1, y: 0 }}
// // //                 exit={{ opacity: 0 }}
// // //                 className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm"
// // //               >
// // //                 <div className="flex items-center gap-3 mb-2">
// // //                   <div className="bg-emerald-200 p-2 rounded-full">
// // //                     <Check size={20} className="text-emerald-700" />
// // //                   </div>
// // //                   <div className="font-bold text-lg">Report Submitted Successfully</div>
// // //                 </div>

// // //                 <div className="pl-11 space-y-1">
// // //                   {/* <div>
// // //                     <span className="font-semibold">Priority Level:</span>{' '}
// // //                     <span
// // //                       className={cn(
// // //                         'inline-block px-2 py-0.5 rounded text-xs font-bold uppercase',
// // //                         result.priority_level === 'High' ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800',
// // //                       )}
// // //                     >
// // //                       {result.priority_level}
// // //                     </span>
// // //                   </div> */}

// // //                   {Array.isArray(result.authorities) && result.authorities.length > 0 && (
// // //                     <div>
// // //                       <span className="font-semibold">Notified Authorities:</span> {result.authorities.join(', ')}
// // //                     </div>
// // //                   )}

// // //                   <div className="mt-4 pt-4 border-t border-emerald-200">
// // //                     <button onClick={() => navigate('/')} className="text-sm font-semibold underline hover:text-emerald-700">
// // //                       Return to Home
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </motion.div>
// // //             )}
// // //           </AnimatePresence>
// // //         </section>

// // //         {/* RIGHT */}
// // //         <aside className="space-y-6">
// // //           <div className="sticky top-28">
// // //             <motion.div
// // //               initial={{ opacity: 0, x: 20 }}
// // //               animate={{ opacity: 1, x: 0 }}
// // //               transition={{ delay: 0.2 }}
// // //               className="rounded-3xl border border-[#E8DCC4]/50 bg-white/90 backdrop-blur-md p-6 shadow-lg"
// // //             >
// // //               <div className="flex items-center gap-2 mb-1">
// // //                 <Activity size={18} className="text-[#9CAF88]" />
// // //                 <div className="text-sm font-bold text-[#2D3B2D] uppercase tracking-wider">Live Summary</div>
// // //               </div>

// // //               <div className="text-xs text-[#2D3B2D]/60 mb-6">Review your report details before submitting.</div>

// // //               <div className="space-y-3">
// // //                 <Stat label="Disaster" value={form.disaster_type} icon={AlertTriangle} />
// // //                 <Stat label="Risk Level" value={form.area_risk_level} icon={ShieldAlert} />
// // //                 <Stat label="Area" value={form.area_type} icon={MapPin} />
// // //                 <Stat label="Affected" value={prettyVictimBand} icon={Users} />
// // //                 <Stat label="Duration" value={form.duration_band} icon={Clock} />
// // //                 <Stat
// // //                   label="GPS Location"
// // //                   icon={MapPin}
// // //                   value={form.location ? `${form.location.lat.toFixed(4)}, ${form.location.lng.toFixed(4)}` : 'Not detected'}
// // //                 />
// // //               </div>

// // //               <div className="mt-6 pt-6 border-t border-[#E8DCC4]/50">
// // //                 <div className="text-xs font-bold text-[#2D3B2D] uppercase tracking-wider mb-3">Quick Tips</div>
// // //                 <ul className="text-sm text-[#2D3B2D]/70 space-y-2 list-disc pl-4 marker:text-[#9CAF88]">
// // //                   <li>Be concise but specific.</li>
// // //                   <li>Mention life-threatening injuries first.</li>
// // //                   <li>Stay calm and stay put if safe.</li>
// // //                 </ul>
// // //               </div>
// // //             </motion.div>
// // //           </div>
// // //         </aside>
// // //       </main>
// // //     </div>
// // //   )
// // // }


import React, { useMemo, useState } from 'react'
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
  ShieldAlert,
} from 'lucide-react'
import { submitVictim } from '../api/api'
import { useNavigate } from 'react-router-dom'

/* -------------------- CONSTANTS -------------------- */
const DISASTERS = ['Flood', 'Tsunami', 'Cyclone', 'Landslide', 'Fire', 'Other', 'Unknown']
const RISK = ['Low', 'Medium', 'High', 'Unknown']
const AREA = ['Urban', 'Rural', 'Unknown']
const DURATION = ['<1-6h', '6-24h', '>24h', 'Unknown']

const VICTIM_BANDS = [
  { label: '1 person', value: 'C1' },
  { label: '2–5 people', value: 'C2_5' },
  { label: '6–10 people', value: 'C6_10' },
  { label: '10+ people', value: 'C10PLUS' },
  { label: 'Not sure', value: 'CUNKNOWN' },
]

/* -------------------- HELPERS -------------------- */
const cn = (...xs) => xs.filter(Boolean).join(' ')

const isValidLat = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -90 && v <= 90
const isValidLng = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -180 && v <= 180

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

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-[#E8DCC4] text-[#2D3B2D] px-3 py-1 text-xs font-bold uppercase tracking-wide">
    {children}
  </span>
)

/* -------------------- MAIN -------------------- */
export default function VictimWizard() {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  let navigate = (path) => console.log('Navigate to:', path)
  try {
    navigate = useNavigate()
  } catch (e) {}

  const [form, setForm] = useState({
    disaster_type: 'Unknown',
    area_risk_level: 'Unknown',
    area_type: 'Unknown',
    duration_band: 'Unknown',
    victim_count_band: 'CUNKNOWN',

    children: 0,
    elderly: 0,
    pregnant: 0,
    disability: 0,
    chronic_illness: 0,
    health_issue_6h: 0,

    trapped: 0,
    fire_smoke: 0,
    water_rising: 0,
    medical_emergency: 0,

    additional_text: '',

    // Location (auto GPS or manual)
    location: null, // {lat,lng}
    address: '',
    manual_lat: '',
    manual_lng: '',
  })

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

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
    // Priority: GPS > Manual Lat/Lng > Address (geocode by backend)
    if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
      return { latitude: form.location.lat, longitude: form.location.lng, source: 'gps' }
    }

    const mLat = Number(form.manual_lat)
    const mLng = Number(form.manual_lng)
    if (form.manual_lat !== '' && form.manual_lng !== '' && isValidLat(mLat) && isValidLng(mLng)) {
      return { latitude: mLat, longitude: mLng, source: 'manual' }
    }

    if (String(form.address || '').trim().length >= 3) {
      return { latitude: null, longitude: null, source: 'address', address: String(form.address).trim() }
    }

    return { latitude: null, longitude: null, source: 'none' }
  }

  const canNext = useMemo(() => {
    if (step === 1) return true
    if (step === 2) return Boolean(form.victim_count_band)
    if (step === 3) return true
    if (step === 4) return true
    return true
  }, [step, form])

  const progressPct = Math.round((step / totalSteps) * 100)

  async function submitAll() {
    setSubmitting(true)
    setError('')
    setResult(null)

    try {
      const loc = getBestLocationForSubmit()
      if (loc.source === 'none') {
        setError('Please detect GPS OR enter an address OR enter manual latitude/longitude.')
        return
      }

      const payload = {
        disaster_type: form.disaster_type,
        area_risk_level: form.area_risk_level,
        area_type: form.area_type,
        duration_band: form.duration_band,
        victim_count_band: form.victim_count_band,

        children: Number(form.children),
        elderly: Number(form.elderly),
        pregnant: Number(form.pregnant),
        disability: Number(form.disability),
        chronic_illness: Number(form.chronic_illness),
        health_issue_6h: Number(form.health_issue_6h),

        trapped: Number(form.trapped),
        fire_smoke: Number(form.fire_smoke),
        water_rising: Number(form.water_rising),
        medical_emergency: Number(form.medical_emergency),

        additional_text: form.additional_text,

        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.source === 'address' ? loc.address : null,
        location_source: loc.source, // optional but useful
      }

      const res = await submitVictim(payload)
      setResult({
        victim_id: res._id || res.id,
        priority_level: res.priority_level,
        authorities: res.authorities,
        geo_features: res.geo_features, // optional if backend returns it
      })
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setSubmitting(false)
    }
  }

  const stepInfo = useMemo(() => {
    switch (step) {
      case 1:
        return { title: 'Basic Details', subtitle: 'Select what you know. Unknown is allowed.' }
      case 2:
        return { title: 'People & Danger', subtitle: 'Approximate the number of affected people.' }
      case 3:
        return { title: 'Vulnerability Check', subtitle: 'These factors increase urgency and response type.' }
      case 4:
        return { title: 'Final Details', subtitle: 'Add time + short message, then submit.' }
      default:
        return { title: '', subtitle: '' }
    }
  }, [step])

  const prettyVictimBand =
    VICTIM_BANDS.find((b) => b.value === form.victim_count_band)?.label || form.victim_count_band

  const liveLocationText = useMemo(() => {
    if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
      return `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}`
    }
    const mLat = Number(form.manual_lat)
    const mLng = Number(form.manual_lng)
    if (form.manual_lat !== '' && form.manual_lng !== '' && isValidLat(mLat) && isValidLng(mLng)) {
      return `${mLat.toFixed(5)}, ${mLng.toFixed(5)} (manual)`
    }
    if (String(form.address || '').trim().length >= 3) return `${String(form.address).trim()} (address)`
    return 'Not detected'
  }, [form.location, form.manual_lat, form.manual_lng, form.address])

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#2D3B2D] font-sans selection:bg-[#9CAF88] selection:text-white">
      {/* Header */}
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
            <div className="hidden sm:block">
              <Badge>
                Step {step}/{totalSteps}
              </Badge>
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

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <section className="lg:col-span-2 space-y-6">
          {/* Progress Header */}
          <div className="rounded-3xl border border-[#E8DCC4]/50 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-bold text-[#9CAF88] uppercase tracking-wider mb-1"
                >
                  {stepInfo.title}
                </motion.div>
                <motion.div
                  key={`sub-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl sm:text-2xl font-bold text-[#2D3B2D]"
                >
                  {stepInfo.subtitle}
                </motion.div>
              </div>
              <div className="text-2xl font-bold text-[#9CAF88]/40">{progressPct}%</div>
            </div>

            <div className="h-3 w-full rounded-full bg-[#F5EFE6] overflow-hidden">
              <motion.div
                className="h-full bg-[#9CAF88]"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 1 && (
                <>
                  <QuestionBlock title="What disaster is happening?" hint="Select the closest option." icon={AlertTriangle}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {DISASTERS.map((d) => (
                        <Chip key={d} active={form.disaster_type === d} onClick={() => setField('disaster_type', d)}>
                          {d}
                        </Chip>
                      ))}
                    </div>
                  </QuestionBlock>

                  <QuestionBlock title="Your Location" hint="Use GPS (best). Or enter address / coordinates." icon={MapPin}>
                    <div className="bg-[#F5EFE6] p-4 rounded-2xl space-y-4">
                      {/* GPS */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <button
                          type="button"
                          onClick={detectLocation}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5BA4C9] text-white font-bold shadow-md hover:bg-[#4A93B8] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <MapPin size={18} />
                          Detect Location
                        </button>

                        <div className="text-sm text-[#2D3B2D]/70">
                          {form.location ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#2D3B2D]">Location Acquired</span>
                              <span className="font-mono text-xs">
                                {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                              </span>
                            </div>
                          ) : (
                            <span>GPS not detected yet</span>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-sm font-semibold text-[#2D3B2D]">Address (optional)</label>
                        <input
                          value={form.address}
                          onChange={(e) => setField('address', e.target.value)}
                          placeholder="e.g., Palam Handiya, Mahiyanganaya"
                          className="w-full mt-2 rounded-xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
                        />
                        <div className="text-xs text-[#2D3B2D]/60 mt-2">
                          If GPS is off, we will convert this address to coordinates automatically.
                        </div>
                      </div>

                      {/* Manual Lat/Lng */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-[#2D3B2D]">Manual Latitude</label>
                          <input
                            value={form.manual_lat}
                            onChange={(e) => setField('manual_lat', e.target.value)}
                            inputMode="decimal"
                            placeholder="e.g., 7.25012"
                            className="w-full mt-2 rounded-xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-[#2D3B2D]">Manual Longitude</label>
                          <input
                            value={form.manual_lng}
                            onChange={(e) => setField('manual_lng', e.target.value)}
                            inputMode="decimal"
                            placeholder="e.g., 80.55233"
                            className="w-full mt-2 rounded-xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
                          />
                        </div>
                      </div>

                      <div className="text-xs text-[#2D3B2D]/60">
                        Submit will use: <b>GPS</b> if available → else <b>Manual</b> → else <b>Address</b>.
                      </div>
                    </div>
                  </QuestionBlock>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuestionBlock title="Area Danger Level" hint="High = life-threatening." icon={ShieldAlert}>
                      <div className="grid grid-cols-2 gap-3">
                        {RISK.map((r) => (
                          <Chip
                            key={r}
                            active={form.area_risk_level === r}
                            onClick={() => setField('area_risk_level', r)}
                          >
                            {r}
                          </Chip>
                        ))}
                      </div>
                    </QuestionBlock>

                    <QuestionBlock title="Area Type" hint="Urban = city, Rural = village" icon={MapPin}>
                      <div className="grid grid-cols-2 gap-3">
                        {AREA.map((a) => (
                          <Chip key={a} active={form.area_type === a} onClick={() => setField('area_type', a)}>
                            {a}
                          </Chip>
                        ))}
                      </div>
                    </QuestionBlock>
                  </div>
                </>
              )}

              {step === 2 && (
                <QuestionBlock title="How many people need help?" hint="Choose the closest option." icon={Users}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VICTIM_BANDS.map((b) => (
                      <Chip
                        key={b.value}
                        active={form.victim_count_band === b.value}
                        onClick={() => setField('victim_count_band', b.value)}
                      >
                        {b.label}
                      </Chip>
                    ))}
                  </div>
                </QuestionBlock>
              )}

              {step === 3 && (
                <QuestionBlock title="Vulnerability Check" hint="Turn ON only if YES. Helps prioritize medical aid." icon={Activity}>
                  <div className="divide-y divide-[#E8DCC4]/30">
                    <ToggleRow label="Children present" desc="Under 18 years" value={form.children} onChange={(v) => setField('children', v)} />
                    <ToggleRow label="Elderly present" desc="Above 60 years" value={form.elderly} onChange={(v) => setField('elderly', v)} />
                    <ToggleRow label="Pregnant person" desc="May require faster medical response" value={form.pregnant} onChange={(v) => setField('pregnant', v)} />
                    <ToggleRow label="Disability" desc="Mobility/vision/hearing limitations" value={form.disability} onChange={(v) => setField('disability', v)} />
                    <ToggleRow label="Chronic illness" desc="Asthma, heart condition, diabetes, etc." value={form.chronic_illness} onChange={(v) => setField('chronic_illness', v)} />
                    <ToggleRow label="Health issue (last 6h)" desc="Breathing issues, unconscious, bleeding" value={form.health_issue_6h} onChange={(v) => setField('health_issue_6h', v)} />
                  </div>
                </QuestionBlock>
              )}

              {step === 4 && (
                <>
                  <QuestionBlock title="Duration" hint="How long has this been happening?" icon={Clock}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DURATION.map((d) => (
                        <Chip key={d} active={form.duration_band === d} onClick={() => setField('duration_band', d)}>
                          {d}
                        </Chip>
                      ))}
                    </div>
                  </QuestionBlock>

                  <QuestionBlock
                    title="Describe the situation"
                    hint="Details help rescuers prepare (e.g., 'Trapped on roof', 'Water rising fast')"
                    icon={FileText}
                  >
                    <textarea
                      className="w-full rounded-2xl border border-[#E8DCC4] bg-[#F5EFE6]/30 p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent transition-all min-h-[150px] resize-y"
                      placeholder="Type what happened..."
                      value={form.additional_text}
                      onChange={(e) => setField('additional_text', e.target.value)}
                    />
                  </QuestionBlock>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Bar */}
          <div className="rounded-3xl border border-[#E8DCC4]/50 bg-white p-6 flex flex-col sm:flex-row gap-4 shadow-sm mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
              className={cn(
                'w-full sm:w-auto px-8 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2',
                step === 1 || submitting
                  ? 'bg-[#F5EFE6] text-[#2D3B2D]/40 cursor-not-allowed'
                  : 'bg-white border-2 border-[#E8DCC4] text-[#2D3B2D] hover:bg-[#F5EFE6]',
              )}
            >
              <ChevronLeft size={20} />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
                disabled={!canNext || submitting}
                className={cn(
                  'flex-1 py-3 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2',
                  !canNext || submitting
                    ? 'bg-[#E8DCC4] text-[#2D3B2D]/50 cursor-not-allowed'
                    : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] hover:shadow-lg active:scale-95',
                )}
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={submitAll}
                disabled={submitting}
                className={cn(
                  'flex-1 py-3 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2',
                  submitting ? 'bg-[#9CAF88]/70 text-white cursor-wait' : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] hover:shadow-lg active:scale-95',
                )}
              >
                {submitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    Submit Report <Check size={20} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 flex items-start gap-3"
              >
                <AlertTriangle className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Submission Error</div>
                  <div>{error}</div>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-200 p-2 rounded-full">
                    <Check size={20} className="text-emerald-700" />
                  </div>
                  <div className="font-bold text-lg">Report Submitted Successfully</div>
                </div>

                <div className="pl-11 space-y-2">
                  {result.priority_level && (
                    <div>
                      <span className="font-semibold">Priority Level:</span>{' '}
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-200 text-emerald-800">
                        {result.priority_level}
                      </span>
                    </div>
                  )}

                  {Array.isArray(result.authorities) && result.authorities.length > 0 && (
                    <div>
                      <span className="font-semibold">Notified Authorities:</span> {result.authorities.join(', ')}
                    </div>
                  )}

                  {result.geo_features && (
                    <div className="text-sm text-emerald-900/80">
                      <span className="font-semibold">Geo Features:</span>{' '}
                      {JSON.stringify(result.geo_features)}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <button onClick={() => navigate('/')} className="text-sm font-semibold underline hover:text-emerald-700">
                      Return to Home
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT */}
        <aside className="space-y-6">
          <div className="sticky top-28">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-[#E8DCC4]/50 bg-white/90 backdrop-blur-md p-6 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-[#9CAF88]" />
                <div className="text-sm font-bold text-[#2D3B2D] uppercase tracking-wider">Live Summary</div>
              </div>

              <div className="text-xs text-[#2D3B2D]/60 mb-6">Review your report details before submitting.</div>

              <div className="space-y-3">
                <Stat label="Disaster" value={form.disaster_type} icon={AlertTriangle} />
                <Stat label="Risk Level" value={form.area_risk_level} icon={ShieldAlert} />
                <Stat label="Area" value={form.area_type} icon={MapPin} />
                <Stat label="Affected" value={prettyVictimBand} icon={Users} />
                <Stat label="Duration" value={form.duration_band} icon={Clock} />
                <Stat label="Location" icon={MapPin} value={liveLocationText} />
              </div>

              <div className="mt-6 pt-6 border-t border-[#E8DCC4]/50">
                <div className="text-xs font-bold text-[#2D3B2D] uppercase tracking-wider mb-3">Quick Tips</div>
                <ul className="text-sm text-[#2D3B2D]/70 space-y-2 list-disc pl-4 marker:text-[#9CAF88]">
                  <li>Be concise but specific.</li>
                  <li>Mention life-threatening injuries first.</li>
                  <li>Stay calm and stay put if safe.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </aside>
      </main>
    </div>
  )
}
// //////////


// // AccessibleAssistPage.jsx
// // English-only accessible emergency report wizard
// // - Big buttons, minimal text
// // - Tap-to-speak on every option (when Voice ON)
// // - "Cannot hear" uses emoji-heavy rescue card for fast understanding
// // - GPS + Address + Manual Lat/Lng fallback
// // - Uses submitVictim(payload)

// import React, { useMemo, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Droplets,
//   MapPin,
//   Phone,
//   MicOff,
//   Volume2,
//   VolumeX,
//   AlertTriangle,
//   Users,
//   ShieldAlert,
//   Waves,
//   Flame,
//   Mountain,
//   Clock,
//   Check,
//   ChevronLeft,
// } from 'lucide-react'
// import { submitVictim } from '../api/api'
// import { useNavigate } from 'react-router-dom'

// /* -------------------- HELPERS -------------------- */
// const cn = (...xs) => xs.filter(Boolean).join(' ')
// const isValidLat = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -90 && v <= 90
// const isValidLng = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= -180 && v <= 180

// /* -------------------- OPTIONS (ENGLISH ONLY) -------------------- */
// const DISASTER_OPTIONS = [
//   { key: 'Flood', label: 'Flood 🌊', speak: 'Flood', icon: Waves },
//   { key: 'Landslide', label: 'Landslide ⛰️', speak: 'Landslide', icon: Mountain },
//   { key: 'Fire', label: 'Fire 🔥', speak: 'Fire', icon: Flame },
//   { key: 'Other', label: 'Other ❓', speak: 'Other', icon: AlertTriangle },
//   { key: 'Unknown', label: 'Unknown 🤷', speak: 'Unknown', icon: AlertTriangle },
// ]

// const PEOPLE_OPTIONS = [
//   { value: 'C1', label: '1 👤', speak: 'One person' },
//   { value: 'C2_5', label: '2–5 👥', speak: 'Two to five people' },
//   { value: 'C6_10', label: '6–10 👥', speak: 'Six to ten people' },
//   { value: 'C10PLUS', label: '10+ 👪', speak: 'More than ten people' },
//   { value: 'CUNKNOWN', label: 'Not sure 🤷', speak: 'Not sure' },
// ]

// const URGENCY_OPTIONS = [
//   { value: 'High', label: 'High 🚨', speak: 'High danger' },
//   { value: 'Medium', label: 'Medium ⚠️', speak: 'Medium danger' },
//   { value: 'Low', label: 'Low ✅', speak: 'Low danger' },
//   { value: 'Unknown', label: 'Unknown 🤷', speak: 'Unknown danger' },
// ]

// const DURATION_OPTIONS = [
//   { value: '<1-6h', label: 'Less than 6 hours ⏱️', speak: 'Less than six hours' },
//   { value: '6-24h', label: '6–24 hours ⏳', speak: 'Six to twenty four hours' },
//   { value: '>24h', label: 'More than 24 hours 🕐', speak: 'More than twenty four hours' },
//   { value: 'Unknown', label: 'Not sure 🤷', speak: 'Not sure' },
// ]

// /* -------------------- SMALL UI -------------------- */
// const BigCard = ({ title, subtitle, icon: Icon, children }) => (
//   <div className="rounded-3xl border border-[#E8DCC4]/60 bg-white/85 backdrop-blur-sm p-5 sm:p-7 shadow-sm">
//     <div className="flex items-start gap-3 mb-4">
//       <div className="p-2 rounded-2xl bg-[#F5EFE6] text-[#9CAF88]">{Icon ? <Icon size={20} /> : null}</div>
//       <div>
//         <div className="text-lg sm:text-xl font-black text-[#2D3B2D]">{title}</div>
//         {subtitle ? <div className="text-sm text-[#2D3B2D]/60 mt-0.5">{subtitle}</div> : null}
//       </div>
//     </div>
//     {children}
//   </div>
// )

// const SpeakBtn = ({ onClick, disabled }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     disabled={disabled}
//     className={cn(
//       'shrink-0 px-4 py-2 rounded-full border font-black flex items-center gap-2',
//       disabled
//         ? 'border-[#E8DCC4] text-[#2D3B2D]/40 bg-white/40 cursor-not-allowed'
//         : 'border-[#9CAF88] bg-white hover:bg-[#F5EFE6]',
//     )}
//     title={disabled ? 'Turn on Voice first' : 'Tap to speak'}
//   >
//     <Volume2 size={18} /> Speak
//   </button>
// )

// const BigButton = ({ active, onClick, children, icon: Icon }) => (
//   <motion.button
//     type="button"
//     onClick={onClick}
//     whileTap={{ scale: 0.98 }}
//     className={cn(
//       'w-full rounded-3xl px-4 py-4 sm:py-5 border text-left shadow-sm transition-all',
//       active ? 'bg-[#9CAF88] text-white border-[#9CAF88]' : 'bg-white/70 text-[#2D3B2D] border-[#E8DCC4] hover:bg-white',
//     )}
//   >
//     <div className="flex items-center gap-3">
//       {Icon ? (
//         <div className={cn('p-2 rounded-2xl', active ? 'bg-white/20' : 'bg-[#F5EFE6] text-[#9CAF88]')}>
//           <Icon size={20} />
//         </div>
//       ) : null}
//       <div className="font-extrabold text-base sm:text-lg w-full">{children}</div>
//     </div>
//   </motion.button>
// )

// const TogglePill = ({ label, desc, value, onChange, icon: Icon, rightSlot }) => (
//   <button
//     type="button"
//     onClick={() => onChange(value ? 0 : 1)}
//     className={cn(
//       'w-full rounded-3xl px-4 py-4 border shadow-sm transition-all flex items-center justify-between gap-3',
//       value ? 'bg-[#9CAF88] text-white border-[#9CAF88]' : 'bg-white/70 border-[#E8DCC4] text-[#2D3B2D]',
//     )}
//   >
//     <div className="flex items-center gap-3">
//       {Icon ? (
//         <div className={cn('p-2 rounded-2xl', value ? 'bg-white/20' : 'bg-[#F5EFE6] text-[#9CAF88]')}>
//           <Icon size={18} />
//         </div>
//       ) : null}
//       <div className="text-left">
//         <div className="font-extrabold">{label}</div>
//         {desc ? <div className={cn('text-xs', value ? 'text-white/85' : 'text-[#2D3B2D]/60')}>{desc}</div> : null}
//       </div>
//     </div>

//     <div className="flex items-center gap-3">
//       {rightSlot ? rightSlot : null}
//       <div className={cn('h-8 w-14 rounded-full p-1', value ? 'bg-white/20' : 'bg-[#F5EFE6]')}>
//         <motion.div
//           className="h-6 w-6 rounded-full bg-white shadow"
//           animate={{ x: value ? 24 : 0 }}
//           transition={{ type: 'spring', stiffness: 500, damping: 30 }}
//         />
//       </div>
//     </div>
//   </button>
// )

// /* -------------------- MAIN PAGE -------------------- */
// export default function AccessibleAssistPage() {
//   const [step, setStep] = useState(1)
//   const total = 3

//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState(null)

//   let navigate = (path) => console.log('Navigate to:', path)
//   try {
//     navigate = useNavigate()
//   } catch (e) {}

//   const [form, setForm] = useState({
//     // backend payload
//     disaster_type: 'Unknown',
//     area_risk_level: 'Unknown',
//     area_type: 'Unknown',
//     duration_band: 'Unknown',
//     victim_count_band: 'CUNKNOWN',

//     // vulnerability + danger toggles (0/1)
//     children: 0,
//     elderly: 0,
//     pregnant: 0,
//     disability: 0,
//     chronic_illness: 0,
//     health_issue_6h: 0,

//     trapped: 0,
//     fire_smoke: 0,
//     water_rising: 0,
//     medical_emergency: 0,

//     // assistive
//     cant_speak: 0,
//     hearing_impairment: 0,

//     contact_phone: '',
//     additional_text: '',

//     // location
//     location: null, // {lat,lng}
//     address: '',
//     manual_lat: '',
//     manual_lng: '',
//   })

//   const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

//   // Text-to-speech
//   const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
//   const [ttsOn, setTtsOn] = useState(false)

//   const speak = (text) => {
//     if (!ttsSupported || !ttsOn) return
//     try {
//       window.speechSynthesis.cancel()
//       const u = new SpeechSynthesisUtterance(String(text))
//       u.lang = 'en-US'
//       u.rate = 0.95
//       u.pitch = 1
//       window.speechSynthesis.speak(u)
//     } catch (e) {}
//   }

//   const detectLocation = () => {
//     setError('')
//     if (!navigator.geolocation) {
//       setError('GPS not supported. Please type an address or enter manual coordinates.')
//       return
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude } = pos.coords
//         setField('location', { lat: latitude, lng: longitude })
//         if (ttsOn) speak('Location detected')
//       },
//       () => {
//         setError('Could not get location. Turn on GPS or type an address / enter coordinates.')
//       },
//       { enableHighAccuracy: true, timeout: 10000 },
//     )
//   }

//   const getBestLocationForSubmit = () => {
//     if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
//       return { latitude: form.location.lat, longitude: form.location.lng, source: 'gps' }
//     }
//     const mLat = Number(form.manual_lat)
//     const mLng = Number(form.manual_lng)
//     if (form.manual_lat !== '' && form.manual_lng !== '' && isValidLat(mLat) && isValidLng(mLng)) {
//       return { latitude: mLat, longitude: mLng, source: 'manual' }
//     }
//     if (String(form.address || '').trim().length >= 3) {
//       return { latitude: null, longitude: null, source: 'address', address: String(form.address).trim() }
//     }
//     return { latitude: null, longitude: null, source: 'none' }
//   }

//   const progressPct = Math.round((step / total) * 100)

//   const assistCardText = useMemo(() => {
//     const lines = []

//     if (form.cant_speak) lines.push('🧏‍♂️🚫🗣️  I CANNOT SPEAK')
//     if (form.hearing_impairment) lines.push('🦻🚫  I CANNOT HEAR')

//     if (form.trapped) lines.push('🏠🔒  WE ARE TRAPPED INSIDE')
//     if (form.water_rising) lines.push('🌊⬆️  WATER LEVEL IS RISING')
//     if (form.fire_smoke) lines.push('🔥💨  FIRE / SMOKE PRESENT')
//     if (form.medical_emergency || form.health_issue_6h) lines.push('🚑🩺  MEDICAL EMERGENCY')

//     const peopleLabel = PEOPLE_OPTIONS.find((x) => x.value === form.victim_count_band)?.label || form.victim_count_band
//     lines.push(`👥  PEOPLE: ${peopleLabel}`)
//     lines.push(`⚠️  DISASTER: ${form.disaster_type}`)
//     lines.push(`📞  PHONE: ${form.contact_phone || '—'}`)
//     return lines.join('\n')
//   }, [form])

//   const liveLocationText = useMemo(() => {
//     if (form.location && isValidLat(form.location.lat) && isValidLng(form.location.lng)) {
//       return `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)} (GPS)`
//     }
//     const mLat = Number(form.manual_lat)
//     const mLng = Number(form.manual_lng)
//     if (form.manual_lat !== '' && form.manual_lng !== '' && isValidLat(mLat) && isValidLng(mLng)) {
//       return `${mLat.toFixed(5)}, ${mLng.toFixed(5)} (manual)`
//     }
//     if (String(form.address || '').trim().length >= 3) return `${String(form.address).trim()} (address)`
//     return 'Not set'
//   }, [form.location, form.manual_lat, form.manual_lng, form.address])

//   const stepTitle = useMemo(() => {
//     if (step === 1) return 'Quick Info'
//     if (step === 2) return 'Danger'
//     return 'Submit'
//   }, [step])

//   const canSubmit = useMemo(() => {
//     const loc = getBestLocationForSubmit()
//     return loc.source !== 'none'
//   }, [form.location, form.manual_lat, form.manual_lng, form.address])

//   async function submitAll() {
//     setSubmitting(true)
//     setError('')
//     setResult(null)

//     try {
//       const loc = getBestLocationForSubmit()
//       if (loc.source === 'none') {
//         setError('Please use GPS OR type an address OR enter manual latitude/longitude.')
//         return
//       }

//       const payload = {
//         disaster_type: form.disaster_type,
//         area_risk_level: form.area_risk_level,
//         area_type: form.area_type,
//         duration_band: form.duration_band,
//         victim_count_band: form.victim_count_band,

//         children: Number(form.children),
//         elderly: Number(form.elderly),
//         pregnant: Number(form.pregnant),
//         disability: Number(form.disability),
//         chronic_illness: Number(form.chronic_illness),
//         health_issue_6h: Number(form.health_issue_6h),

//         trapped: Number(form.trapped),
//         fire_smoke: Number(form.fire_smoke),
//         water_rising: Number(form.water_rising),
//         medical_emergency: Number(form.medical_emergency),

//         // Assist flags embedded in additional_text (no backend schema change needed)
//         additional_text: [
//           form.additional_text?.trim(),
//           form.cant_speak ? '[ASSIST: CANNOT_SPEAK]' : '',
//           form.hearing_impairment ? '[ASSIST: CANNOT_HEAR]' : '',
//           form.contact_phone ? `[PHONE: ${form.contact_phone}]` : '',
//         ]
//           .filter(Boolean)
//           .join('\n'),

//         latitude: loc.latitude,
//         longitude: loc.longitude,
//         address: loc.source === 'address' ? loc.address : null,
//         location_source: loc.source,
//       }

//       const res = await submitVictim(payload)
//       setResult({
//         victim_id: res._id || res.id,
//         priority_level: res.priority_level,
//         authorities: res.authorities,
//       })

//       if (ttsOn) speak('Report submitted successfully')
//     } catch (e) {
//       setError(String(e?.message || e))
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#F5EFE6] text-[#2D3B2D] selection:bg-[#9CAF88] selection:text-white">
//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8DCC4]/60">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#87CEEB] p-2 rounded-full text-white">
//               <Droplets size={20} fill="currentColor" />
//             </div>
//             <div>
//               <div className="text-xs font-black text-[#9CAF88] tracking-wider uppercase">RescueSmart</div>
//               <div className="text-lg font-black leading-none">Easy Help</div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={() => setTtsOn((v) => !v)}
//               disabled={!ttsSupported}
//               className={cn(
//                 'px-4 py-2 rounded-full border font-bold flex items-center gap-2',
//                 !ttsSupported
//                   ? 'border-[#E8DCC4] text-[#2D3B2D]/40 bg-white/40 cursor-not-allowed'
//                   : ttsOn
//                     ? 'border-[#9CAF88] bg-[#9CAF88] text-white'
//                     : 'border-[#E8DCC4] bg-white/70 hover:bg-white',
//               )}
//               title={ttsSupported ? 'Voice read-out' : 'Voice not supported on this browser'}
//             >
//               {ttsOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
//               Voice
//             </button>

//             <button
//               onClick={() => navigate('/')}
//               className="px-4 py-2 rounded-full border border-[#E8DCC4] hover:bg-[#F5EFE6] font-bold"
//             >
//               Exit
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-12 space-y-6">
//         {/* Progress */}
//         <div className="rounded-3xl border border-[#E8DCC4]/60 bg-white/80 p-5 sm:p-7 shadow-sm">
//           <div className="flex items-center justify-between gap-4">
//             <div className="font-black text-xl">{stepTitle}</div>
//             <div className="text-sm font-black text-[#9CAF88]">
//               {progressPct}% • Step {step}/{total}
//             </div>
//           </div>
//           <div className="mt-4 h-3 rounded-full bg-[#F5EFE6] overflow-hidden">
//             <motion.div
//               className="h-full bg-[#9CAF88]"
//               initial={{ width: 0 }}
//               animate={{ width: `${(step / total) * 100}%` }}
//               transition={{ type: 'spring', stiffness: 120, damping: 20 }}
//             />
//           </div>
//         </div>

//         {/* Mute/Deaf quick card */}
//         <BigCard
//           title="Accessibility (Show to rescuers)"
//           subtitle="Turn ON if true. Then show the card below."
//           icon={MicOff}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <TogglePill
//               label="Cannot speak 🗣️🚫"
//               desc="Mute / speech difficulty"
//               value={form.cant_speak}
//               onChange={(v) => {
//                 setField('cant_speak', v)
//                 if (ttsOn) speak(v ? 'Cannot speak enabled' : 'Cannot speak disabled')
//               }}
//               icon={MicOff}
//               rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('I cannot speak')} />}
//             />
//             <TogglePill
//               label="Cannot hear 🦻🚫"
//               desc="Deaf / cannot hear sound"
//               value={form.hearing_impairment}
//               onChange={(v) => {
//                 setField('hearing_impairment', v)
//                 if (ttsOn) speak(v ? 'Cannot hear enabled' : 'Cannot hear disabled')
//               }}
//               icon={Phone}
//               rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('I cannot hear')} />}
//             />
//           </div>

//           <div className="mt-4 rounded-3xl border border-[#E8DCC4]/70 bg-[#F5EFE6]/60 p-4">
//             <div className="flex items-center justify-between gap-3 mb-2">
//               <div className="font-black">SHOW THIS CARD</div>
//               <SpeakBtn
//                 disabled={!ttsSupported || !ttsOn}
//                 onClick={() => speak(assistCardText.replaceAll('\n', '. '))}
//               />
//             </div>
//             <pre className="whitespace-pre-wrap text-sm font-black text-[#2D3B2D] leading-relaxed">
//               {assistCardText}
//             </pre>
//           </div>

//           <div className="mt-4">
//             <label className="text-sm font-black">Phone (optional)</label>
//             <input
//               value={form.contact_phone}
//               onChange={(e) => setField('contact_phone', e.target.value)}
//               inputMode="tel"
//               placeholder="07X XXX XXXX"
//               className="mt-2 w-full rounded-2xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
//             />
//           </div>
//         </BigCard>

//         {/* Steps */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={step}
//             initial={{ opacity: 0, x: 12 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -12 }}
//             transition={{ duration: 0.25 }}
//             className="space-y-6"
//           >
//             {/* STEP 1 */}
//             {step === 1 && (
//               <>
//                 <BigCard title="What is happening?" subtitle="Pick the closest option." icon={AlertTriangle}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {DISASTER_OPTIONS.map((d) => (
//                       <BigButton
//                         key={d.key}
//                         active={form.disaster_type === d.key}
//                         onClick={() => {
//                           setField('disaster_type', d.key)
//                           speak(d.speak)
//                         }}
//                         icon={d.icon}
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <span>{d.label}</span>
//                           <SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak(d.speak)} />
//                         </div>
//                       </BigButton>
//                     ))}
//                   </div>
//                 </BigCard>

//                 <BigCard title="How many people?" subtitle="Choose Not sure if unsure." icon={Users}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {PEOPLE_OPTIONS.map((p) => (
//                       <BigButton
//                         key={p.value}
//                         active={form.victim_count_band === p.value}
//                         onClick={() => {
//                           setField('victim_count_band', p.value)
//                           speak(p.speak)
//                         }}
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <span className="text-xl">{p.label}</span>
//                           <SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak(p.speak)} />
//                         </div>
//                       </BigButton>
//                     ))}
//                   </div>
//                 </BigCard>

//                 <BigCard title="Location (GPS is best)" subtitle="Use GPS OR type an address OR enter coordinates." icon={MapPin}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <button
//                       type="button"
//                       onClick={detectLocation}
//                       className="rounded-3xl px-5 py-4 bg-[#5BA4C9] text-white font-black shadow-md hover:bg-[#4A93B8] active:scale-[0.99] flex items-center justify-center gap-2"
//                     >
//                       <MapPin size={18} />
//                       Get Location (GPS)
//                     </button>

//                     <div className="rounded-3xl border border-[#E8DCC4] bg-white/70 px-4 py-4">
//                       <div className="text-xs font-black text-[#2D3B2D]/60">Current</div>
//                       <div className="font-black mt-1">{liveLocationText}</div>
//                     </div>
//                   </div>

//                   <div className="mt-4">
//                     <label className="text-sm font-black">Address (optional)</label>
//                     <input
//                       value={form.address}
//                       onChange={(e) => setField('address', e.target.value)}
//                       placeholder="e.g., Gampola, Weegulawatta"
//                       className="mt-2 w-full rounded-2xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
//                     />
//                   </div>

//                   <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div>
//                       <label className="text-sm font-black">Manual Latitude</label>
//                       <input
//                         value={form.manual_lat}
//                         onChange={(e) => setField('manual_lat', e.target.value)}
//                         inputMode="decimal"
//                         placeholder="e.g., 7.25012"
//                         className="mt-2 w-full rounded-2xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-sm font-black">Manual Longitude</label>
//                       <input
//                         value={form.manual_lng}
//                         onChange={(e) => setField('manual_lng', e.target.value)}
//                         inputMode="decimal"
//                         placeholder="e.g., 80.55233"
//                         className="mt-2 w-full rounded-2xl border border-[#E8DCC4] bg-white/70 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
//                       />
//                     </div>
//                   </div>

//                   <div className="mt-3 text-xs font-semibold text-[#2D3B2D]/70">
//                     Submit will use: <b>GPS</b> → else <b>manual coords</b> → else <b>address</b>.
//                   </div>
//                 </BigCard>
//               </>
//             )}

//             {/* STEP 2 */}
//             {step === 2 && (
//               <>
//                 <BigCard title="How dangerous is it?" subtitle="High = life-threatening." icon={ShieldAlert}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {URGENCY_OPTIONS.map((u) => (
//                       <BigButton
//                         key={u.value}
//                         active={form.area_risk_level === u.value}
//                         onClick={() => {
//                           setField('area_risk_level', u.value)
//                           speak(u.speak)
//                         }}
//                         icon={ShieldAlert}
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <span>{u.label}</span>
//                           <SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak(u.speak)} />
//                         </div>
//                       </BigButton>
//                     ))}
//                   </div>
//                 </BigCard>

//                 <BigCard title="What is happening now?" subtitle="Turn ON if YES." icon={AlertTriangle}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <TogglePill
//                       label="We are trapped 🏠🔒"
//                       desc="Inside / upper floor"
//                       value={form.trapped}
//                       onChange={(v) => {
//                         setField('trapped', v)
//                         speak(v ? 'We are trapped' : 'Not trapped')
//                       }}
//                       icon={AlertTriangle}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('We are trapped inside')} />}
//                     />
//                     <TogglePill
//                       label="Water rising 🌊⬆️"
//                       desc="Rising fast"
//                       value={form.water_rising}
//                       onChange={(v) => {
//                         setField('water_rising', v)
//                         speak(v ? 'Water level is rising' : 'Water not rising')
//                       }}
//                       icon={Waves}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Water level is rising')} />}
//                     />
//                     <TogglePill
//                       label="Smoke / fire 🔥💨"
//                       desc="Smoke present"
//                       value={form.fire_smoke}
//                       onChange={(v) => {
//                         setField('fire_smoke', v)
//                         speak(v ? 'There is fire or smoke' : 'No fire or smoke')
//                       }}
//                       icon={Flame}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('There is fire or smoke')} />}
//                     />
//                     <TogglePill
//                       label="Medical emergency 🚑🩺"
//                       desc="Bleeding / breathing / unconscious"
//                       value={form.medical_emergency}
//                       onChange={(v) => {
//                         setField('medical_emergency', v)
//                         speak(v ? 'Medical emergency' : 'No medical emergency')
//                       }}
//                       icon={AlertTriangle}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Medical emergency')} />}
//                     />
//                   </div>
//                 </BigCard>

//                 <BigCard title="Vulnerability (optional)" subtitle="Turn ON if YES." icon={Users}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <TogglePill
//                       label="Children 👶"
//                       desc="Under 18"
//                       value={form.children}
//                       onChange={(v) => {
//                         setField('children', v)
//                         speak(v ? 'Children present' : 'No children')
//                       }}
//                       icon={Users}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Children present')} />}
//                     />
//                     <TogglePill
//                       label="Elderly 👴"
//                       desc="Above 60"
//                       value={form.elderly}
//                       onChange={(v) => {
//                         setField('elderly', v)
//                         speak(v ? 'Elderly present' : 'No elderly')
//                       }}
//                       icon={Users}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Elderly present')} />}
//                     />
//                     <TogglePill
//                       label="Pregnant 🤰"
//                       desc="Pregnant person"
//                       value={form.pregnant}
//                       onChange={(v) => {
//                         setField('pregnant', v)
//                         speak(v ? 'Pregnant person present' : 'No pregnant person')
//                       }}
//                       icon={Users}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Pregnant person present')} />}
//                     />
//                     <TogglePill
//                       label="Chronic illness 💊"
//                       desc="Asthma/heart/diabetes"
//                       value={form.chronic_illness}
//                       onChange={(v) => {
//                         setField('chronic_illness', v)
//                         speak(v ? 'Chronic illness present' : 'No chronic illness')
//                       }}
//                       icon={Users}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Chronic illness present')} />}
//                     />
//                     <TogglePill
//                       label="Disability ♿"
//                       desc="Mobility/vision/hearing"
//                       value={form.disability}
//                       onChange={(v) => {
//                         setField('disability', v)
//                         speak(v ? 'Disability present' : 'No disability')
//                       }}
//                       icon={Users}
//                       rightSlot={<SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak('Disability present')} />}
//                     />
//                   </div>
//                 </BigCard>
//               </>
//             )}

//             {/* STEP 3 */}
//             {step === 3 && (
//               <>
//                 <BigCard title="Duration" subtitle="Choose Not sure if unsure." icon={Clock}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {DURATION_OPTIONS.map((d) => (
//                       <BigButton
//                         key={d.value}
//                         active={form.duration_band === d.value}
//                         onClick={() => {
//                           setField('duration_band', d.value)
//                           speak(d.speak)
//                         }}
//                         icon={Clock}
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <span>{d.label}</span>
//                           <SpeakBtn disabled={!ttsSupported || !ttsOn} onClick={() => speak(d.speak)} />
//                         </div>
//                       </BigButton>
//                     ))}
//                   </div>
//                 </BigCard>

//                 <BigCard title="Short note (optional)" subtitle='Example: "2nd floor, water rising"' icon={AlertTriangle}>
//                   <div className="flex items-center justify-between gap-3 mb-3">
//                     <div className="text-sm font-black text-[#2D3B2D]/70">Tap Speak to read the hint</div>
//                     <SpeakBtn
//                       disabled={!ttsSupported || !ttsOn}
//                       onClick={() => speak('Short note. Example: second floor, water rising')}
//                     />
//                   </div>
//                   <textarea
//                     value={form.additional_text}
//                     onChange={(e) => setField('additional_text', e.target.value)}
//                     className="w-full min-h-[120px] rounded-3xl border border-[#E8DCC4] bg-white/70 p-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#9CAF88]"
//                     placeholder='Type here... e.g., "We are on 3rd floor. Need boat."'
//                   />
//                 </BigCard>

//                 <BigCard title="Final check" subtitle="" icon={Check}>
//                   <div className="rounded-3xl border border-[#E8DCC4]/70 bg-[#F5EFE6]/60 p-4">
//                     <div className="flex items-center justify-between gap-3 mb-2">
//                       <div className="text-sm font-black">Summary</div>
//                       <SpeakBtn
//                         disabled={!ttsSupported || !ttsOn}
//                         onClick={() =>
//                           speak(
//                             `Disaster: ${form.disaster_type}. People: ${
//                               PEOPLE_OPTIONS.find((x) => x.value === form.victim_count_band)?.speak || 'Not sure'
//                             }. Risk: ${form.area_risk_level}. Location: ${liveLocationText}.`,
//                           )
//                         }
//                       />
//                     </div>
//                     <div className="text-sm font-semibold text-[#2D3B2D]/80 space-y-1">
//                       <div>• Disaster: {form.disaster_type}</div>
//                       <div>• People: {PEOPLE_OPTIONS.find((x) => x.value === form.victim_count_band)?.label}</div>
//                       <div>• Risk: {form.area_risk_level}</div>
//                       <div>• Location: {liveLocationText}</div>
//                       <div>• Speak/hear: {form.cant_speak || form.hearing_impairment ? 'ON' : '—'}</div>
//                     </div>
//                   </div>
//                 </BigCard>
//               </>
//             )}
//           </motion.div>
//         </AnimatePresence>

//         {/* Action Bar */}
//         <div className="rounded-3xl border border-[#E8DCC4]/60 bg-white/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-3">
//           <button
//             type="button"
//             onClick={() => setStep((s) => Math.max(1, s - 1))}
//             disabled={step === 1 || submitting}
//             className={cn(
//               'px-6 py-3 rounded-full font-black flex items-center justify-center gap-2',
//               step === 1 || submitting
//                 ? 'bg-[#F5EFE6] text-[#2D3B2D]/40 cursor-not-allowed'
//                 : 'bg-white border border-[#E8DCC4] hover:bg-[#F5EFE6]',
//             )}
//           >
//             <ChevronLeft size={18} />
//             Back
//           </button>

//           {step < total ? (
//             <button
//               type="button"
//               onClick={() => setStep((s) => Math.min(total, s + 1))}
//               disabled={submitting}
//               className={cn(
//                 'flex-1 px-6 py-3 rounded-full font-black text-lg shadow-md',
//                 submitting
//                   ? 'bg-[#E8DCC4] text-[#2D3B2D]/40 cursor-not-allowed'
//                   : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] active:scale-[0.99]',
//               )}
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={submitAll}
//               disabled={submitting || !canSubmit}
//               className={cn(
//                 'flex-1 px-6 py-3 rounded-full font-black text-lg shadow-md flex items-center justify-center gap-2',
//                 submitting || !canSubmit
//                   ? 'bg-[#E8DCC4] text-[#2D3B2D]/40 cursor-not-allowed'
//                   : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] active:scale-[0.99]',
//               )}
//             >
//               {submitting ? 'Sending...' : 'Send Report'}
//               <Check size={20} />
//             </button>
//           )}
//         </div>

//         {/* Messages */}
//         <AnimatePresence>
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 flex items-start gap-3"
//             >
//               <AlertTriangle className="mt-0.5" />
//               <div>
//                 <div className="font-black">Error</div>
//                 <div className="font-semibold">{error}</div>
//               </div>
//             </motion.div>
//           )}

//           {result && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm"
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="bg-emerald-200 p-2 rounded-full">
//                   <Check size={20} className="text-emerald-700" />
//                 </div>
//                 <div className="font-black text-lg">Submitted</div>
//               </div>

//               <div className="ml-12 space-y-2 font-semibold">
//                 {result.victim_id ? (
//                   <div>
//                     <span className="font-black">ID:</span> {result.victim_id}
//                   </div>
//                 ) : null}
//                 {result.priority_level ? (
//                   <div>
//                     <span className="font-black">Priority:</span> {result.priority_level}
//                   </div>
//                 ) : null}
//                 {Array.isArray(result.authorities) && result.authorities.length ? (
//                   <div>
//                     <span className="font-black">Authorities:</span> {result.authorities.join(', ')}
//                   </div>
//                 ) : null}

//                 <button onClick={() => navigate('/')} className="mt-3 inline-flex items-center gap-2 font-black underline">
//                   Home
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>
//     </div>
//   )
// }