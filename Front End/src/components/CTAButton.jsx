import React from 'react'

export function CTAButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-full font-bold transition-all active:scale-95'

  const styles =
    variant === 'secondary'
      ? 'bg-white/60 text-[#2D3B2D] border border-[#E8DCC4] hover:bg-white'
      : 'bg-[#9CAF88] text-white hover:bg-[#7A9A6D] shadow-lg shadow-[#9CAF88]/20'

  return (
    <button className={`${base} ${styles} ${className}`} type="button" {...props}>
      {children}
    </button>
  )
}
