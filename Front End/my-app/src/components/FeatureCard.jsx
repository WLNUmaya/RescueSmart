import React, { useState } from "react";
import { motion } from "framer-motion";

export function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-[#E8DCC4]/50 overflow-hidden"
    >
      {/* Ripple Effect Background */}
      <motion.div
        className="absolute inset-0 bg-[#87CEEB]/10 rounded-3xl z-0"
        initial={{ scale: 0, opacity: 0 }}
        animate={isHovered ? { scale: 1.5, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />

      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8DCC4]/30 text-[#7A9A6D] group-hover:scale-110 transition-transform duration-300">
          <Icon size={28} />
        </div>

        <h3 className="text-xl font-bold text-[#2D3B2D] mb-3 group-hover:text-[#5BA4C9] transition-colors duration-300">
          {title}
        </h3>

        <p className="text-[#2D3B2D]/80 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
