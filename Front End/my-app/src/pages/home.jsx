
import React, { useState, Fragment } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Droplets,
  Menu,
  X,
  ChevronDown,
  Bell,
  Map,
  Users,
  Phone,
  Package,
  CloudSun,
  AlertTriangle,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react'

import { WaveBackground } from '../components/WaveBackground'
import { FloatingElements } from '../components/FloatingElements'
import { FeatureCard } from '../components/FeatureCard'
import { CTAButton } from '../components/CTAButton'

/* ---------------- FEATURES DATA ---------------- */
const features = [
  {
    icon: Bell,
    title: 'Instant Emergency Alerts',
    description:
      'Get quick notifications when help is on the way and stay updated about your emergency situation.',
  },
  {
    icon: Map,
    title: 'Find Nearest Help',
    description:
      'We automatically connect you with the closest rescue teams based on your location.',
  },
  {
    icon: Users,
    title: 'Rescue Team Support',
    description:
      'Police, hospitals, army, and rescue teams work together to help you faster.',
  },
  {
    icon: Phone,
    title: 'Easy Emergency Reporting',
    description:
      'Report your emergency in a few simple steps without any technical knowledge.',
  },
  {
    icon: Package,
    title: 'Priority Help System',
    description:
      'Serious and dangerous situations are handled first to save more lives.',
  },
  {
    icon: CloudSun,
    title: 'Disaster Safety Updates',
    description:
      'Receive useful information and safety tips during floods, fires, and other disasters.',
  },
]

/* ---------------- NAVIGATION ---------------- */
function HomeNavigation() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  const navLinks = [
    { name: 'Home', action: () => navigate('/') },
    { name: 'Victim Login', action: () => navigate('/victim/login') },
    { name: 'Victim Register', action: () => navigate('/victim/register') },
    { name: 'Authority Portal', action: () => navigate('/authority/login') },
  ]

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 group"
          >
            <div className="bg-[#87CEEB] p-2 rounded-full text-white group-hover:rotate-12 transition-transform duration-300">
              <Droplets size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-[#2D3B2D]">
              RescueSmart
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={link.action}
                className="text-[#2D3B2D] hover:text-[#5BA4C9] font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5BA4C9] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}

            <CTAButton
              variant="primary"
              onClick={() => navigate('/victim/register')}
              className="!px-6 !py-2 !text-base"
            >
              Get Help Now
            </CTAButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-[#2D3B2D]"
            onClick={() => setIsOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
      >
        <div className="px-4 py-6 space-y-4 flex flex-col items-center">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => {
                link.action()
                setIsOpen(false)
              }}
              className="text-lg font-medium text-[#2D3B2D] hover:text-[#5BA4C9]"
            >
              {link.name}
            </button>
          ))}

          <CTAButton
            variant="primary"
            onClick={() => {
              navigate('/victim/register')
              setIsOpen(false)
            }}
            className="w-full max-w-xs"
          >
            Get Help Now
          </CTAButton>
        </div>
      </motion.div>
    </motion.nav>
  )
}

/* ---------------- HERO SECTION ---------------- */
function HomeHero() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <WaveBackground />
      <FloatingElements />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-[#E8DCC4]/50 text-[#7A9A6D] font-semibold text-sm mb-6 border border-[#E8DCC4]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Disaster Relief & Rescue Coordination
          </motion.span>

          <h1 className="text-5xl md:text-7xl font-bold text-[#2D3B2D] mb-6 leading-tight tracking-tight">
            When Disaster Strikes, <br />
            <span className="text-[#5BA4C9] relative inline-block">
              Help Flows
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-[#87CEEB]/30"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#2D3B2D]/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connecting rescuers, volunteers, and those in need through a
            seamless, real-time coordination network.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-4 flex-wrap">
            <CTAButton
              variant="primary"
              onClick={() => navigate('/victim/register')}
              className="px-6 py-3 text-base sm:text-lg"
            >
              <span className="flex items-center gap-2">
                <UserPlus size={20} />
                Victim Register
              </span>
            </CTAButton>

            <CTAButton
              variant="secondary"
              onClick={() => navigate('/victim/login')}
              className="px-6 py-3 text-base sm:text-lg"
            >
              <span className="flex items-center gap-2">
                <LogIn size={20} />
                Victim Login
              </span>
            </CTAButton>

            <CTAButton
              variant="secondary"
              onClick={() => navigate('/authority/login')}
              className="px-6 py-3 text-base sm:text-lg"
            >
              <span className="flex items-center gap-2">
                <Shield size={20} />
                Authority Portal
              </span>
            </CTAButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-[#7A9A6D]"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  )
}

/* ---------------- STATS SECTION ---------------- */
function StatsSection() {
  const stats = [
    { value: '10k+', label: 'Active Rescuers', color: 'text-[#9CAF88]' },
    { value: '500+', label: 'Communities', color: 'text-[#5BA4C9]' },
    { value: '24/7', label: 'Support', color: 'text-[#E8DCC4]' },
  ]

  return (
    <section className="py-24 bg-[#E8DCC4]/30 relative">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-8 text-[#2D3B2D]"
        >
          Ready to make a difference?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl mb-10 text-[#2D3B2D]/80"
        >
          Join thousands of volunteers and rescuers already using RescueFlow to save lives.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-white rounded-3xl shadow-xl border border-[#9CAF88]/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                <div className="text-center md:text-left">
                  <div className={`text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
                {index < stats.length - 1 && (
                  <div className="h-px md:h-16 w-full md:w-px bg-gray-200" />
                )}
              </Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- CTA SECTION ---------------- */
function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-gradient-to-br from-[#9CAF88] to-[#7A9A6D] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-6 text-white"
        >
          Need Immediate Help?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl mb-10 text-white/90 max-w-2xl mx-auto"
        >
          Register or log in to quickly report your situation and connect with the nearest rescue authorities.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/victim/register')}
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#2D3B2D] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Victim Register
            <ArrowRight size={20} />
          </motion.button>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/victim/login')}
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#2D3B2D] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Victim Login
            <LogIn size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FOOTER ---------------- */
function HomeFooter() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#2D3B2D] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-[#87CEEB] p-2 rounded-full text-white">
                <Droplets size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-bold">RescueSmart</span>
            </div>
            <p className="text-white/70 max-w-sm">
              Empowering communities to respond faster and recover stronger when nature strikes.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-[#9CAF88]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/victim/register')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Victim Register
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/victim/login')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Victim Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/authority/login')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Authority Login
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-[#9CAF88]">Emergency</h3>
            <p className="text-white/70">24/7 Support Available</p>
            <p className="text-2xl font-bold text-[#87CEEB] mt-2">1-800-RESCUE</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} RescueSmart | Final Year Project</p>
        </div>
      </div>
    </footer>
  )
}

/* ---------------- MAIN HOME COMPONENT ---------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#2D3B2D] font-sans">
      <HomeNavigation />

      <main>
        <HomeHero />

        <section id="features" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#E8DCC4]/20 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-[#2D3B2D] mb-4"
              >
                How We Help
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-[#2D3B2D]/70 max-w-2xl mx-auto"
              >
                Powerful tools designed to save lives and streamline disaster response efforts.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        <StatsSection />
        <CTASection />
      </main>

      <HomeFooter />
    </div>
  )
}