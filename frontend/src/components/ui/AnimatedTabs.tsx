import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 p-1.5 bg-[#131B2E]/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/20 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none ${
              isActive ? 'text-[#D4AF37]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-[#1E293B] border border-[#D4AF37]/40 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

