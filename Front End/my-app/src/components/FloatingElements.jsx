import React from 'react'
import { motion } from 'framer-motion'
import { Droplets, Leaf } from 'lucide-react'
export function FloatingElements() {
 
  const elements = [
    {
      type: 'leaf',
      x: '10%',
      y: '20%',
      delay: 0,
      scale: 1,
    },
    {
      type: 'drop',
      x: '85%',
      y: '15%',
      delay: 1,
      scale: 0.8,
    },
    {
      type: 'leaf',
      x: '90%',
      y: '60%',
      delay: 2,
      scale: 1.2,
    },
    {
      type: 'drop',
      x: '15%',
      y: '70%',
      delay: 0.5,
      scale: 0.9,
    },
    {
      type: 'leaf',
      x: '50%',
      y: '10%',
      delay: 1.5,
      scale: 0.7,
    },
  ]
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute text-[#9CAF88]/40"
          style={{
            left: el.x,
            top: el.y,
            scale: el.scale,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            rotateX: [0, 15, 0],
            rotateY: [0, 15, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: el.delay,
          }}
        >
          {el.type === 'leaf' ? (
            <Leaf size={48} fill="currentColor" />
          ) : (
            <Droplets
              size={32}
              className="text-[#87CEEB]/40"
              fill="currentColor"
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
