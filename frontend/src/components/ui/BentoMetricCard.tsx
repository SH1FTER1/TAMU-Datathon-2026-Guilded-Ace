import React from 'react';
import { motion } from 'framer-motion';

export interface BentoCardProps {
  title: string;
  value: string;
  subValue?: string;
  badge?: {
    label: string;
    variant: 'gold' | 'emerald' | 'amber' | 'crimson' | 'cyan';
  };
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

const variantStyles = {
  gold: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
  emerald: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  amber: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  crimson: 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30',
  cyan: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30',
};

export const BentoMetricCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subValue,
  badge,
  icon,
  subtitle,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative p-5 rounded-2xl bg-[#131B2E]/90 backdrop-blur-md border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden group ${className}`}
    >
      {/* Subtle gold ambient glow on hover */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-all pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-[#0B0F19]/60 border border-[#1E293B] text-[#D4AF37]">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div className="my-1">
        <div className="text-2xl lg:text-3xl font-extrabold text-[#E2E8F0] tracking-tight">
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-medium text-[#94A3B8] mt-1 flex items-center gap-1.5">
            {subValue}
          </div>
        )}
      </div>

      {/* Footer / Sub-badge */}
      <div className="mt-4 pt-3 border-t border-[#1E293B]/80 flex items-center justify-between">
        <span className="text-[11px] text-[#94A3B8] truncate">{subtitle || 'Period Metric'}</span>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              variantStyles[badge.variant]
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>
    </motion.div>
  );
};

