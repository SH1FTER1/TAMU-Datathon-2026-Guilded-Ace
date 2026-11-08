import React, { useState } from 'react';
import { FloorNode, Walkway } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Layers, MapPin, Eye } from 'lucide-react';

interface FloorMapProps {
  nodes: FloorNode[];
  walkways: Walkway[];
}

export const FloorMap: React.FC<FloorMapProps> = ({ nodes, walkways }) => {
  const [metricKey, setMetricKey] = useState<'house_win' | 'theo_per_hr' | 'z_score' | 'uptime_pct'>('theo_per_hr');
  const [selectedNode, setSelectedNode] = useState<FloorNode | null>(null);

  // Normalize coordinates for SVG canvas (typically 0-100m)
  const minX = Math.min(...nodes.map((n) => n.x_m || 0), 0);
  const maxX = Math.max(...nodes.map((n) => n.x_m || 0), 60);
  const minY = Math.min(...nodes.map((n) => n.y_m || 0), 0);
  const maxY = Math.max(...nodes.map((n) => n.y_m || 0), 60);

  const scaleX = (x: number) => ((x - minX) / (maxX - minX || 1)) * 600 + 40;
  const scaleY = (y: number) => 400 - ((y - minY) / (maxY - minY || 1)) * 340 + 30;

  const getNodeColor = (node: FloorNode) => {
    const val = node.metrics?.[metricKey];
    if (metricKey === 'z_score') {
      if (val < -2.58) return '#F43F5E'; // Leak
      if (val > 2.58) return '#10B981'; // High
      return '#64748B'; // Normal
    }
    if (metricKey === 'uptime_pct') {
      return val < 88 ? '#F97316' : '#10B981';
    }
    if (metricKey === 'theo_per_hr') {
      if (val > 30) return '#10B981';
      if (val > 18) return '#D4AF37';
      return '#F43F5E';
    }
    // house_win
    return val < 0 ? '#F43F5E' : '#10B981';
  };

  return (
    <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Canvas Header & Metric Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-bold text-[#D4AF37]">Interactive 2D Floor Blueprint</h3>
          </div>
          <p className="text-xs text-[#94A3B8]">
            300+ spatial machine positions with live telemetry and walkway conduits
          </p>
        </div>

        {/* Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setMetricKey('theo_per_hr')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              metricKey === 'theo_per_hr'
                ? 'bg-[#D4AF37] text-[#0B0F19] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Theo / Avail Hr
          </button>
          <button
            onClick={() => setMetricKey('house_win')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              metricKey === 'house_win'
                ? 'bg-[#D4AF37] text-[#0B0F19] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Raw House Win
          </button>
          <button
            onClick={() => setMetricKey('z_score')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              metricKey === 'z_score'
                ? 'bg-[#D4AF37] text-[#0B0F19] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Luck Z-Score
          </button>
          <button
            onClick={() => setMetricKey('uptime_pct')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              metricKey === 'uptime_pct'
                ? 'bg-[#D4AF37] text-[#0B0F19] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Uptime %
          </button>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="relative w-full h-[400px] bg-[#0B0F19]/90 rounded-xl border border-[#1E293B] overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 680 440" className="w-full h-full select-none">
          {/* Subtle Gridlines */}
          <defs>
            <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="680" height="440" fill="url(#floorGrid)" />

          {/* Machine Nodes */}
          {nodes.map((node) => {
            const cx = scaleX(node.x_m);
            const cy = scaleY(node.y_m);
            const color = getNodeColor(node);
            const isSelected = selectedNode?.location_id === node.location_id;

            return (
              <g
                key={node.location_id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4}
                  fill={color}
                  stroke={isSelected ? '#D4AF37' : '#0B0F19'}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all hover:scale-150"
                  opacity={0.85}
                />
              </g>
            );
          })}
        </svg>

        {/* Selected Machine Telemetry Popover */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 bg-[#131B2E] border border-[#D4AF37] rounded-xl p-3 shadow-2xl w-64 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 mb-2">
              <span className="font-bold text-[#D4AF37]">{selectedNode.machine_id || selectedNode.location_id}</span>
              <span className="text-[10px] text-[#94A3B8] uppercase">{selectedNode.zone_id}</span>
            </div>
            <div className="space-y-1 text-[#E2E8F0]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Theme:</span>
                <span className="font-medium truncate max-w-[120px]">{selectedNode.theme || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">House Win:</span>
                <span className="font-semibold">{formatCurrency(selectedNode.metrics?.house_win)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Theo / Hr:</span>
                <span className="font-semibold text-[#10B981]">${selectedNode.metrics?.theo_per_hr?.toFixed(2)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Uptime:</span>
                <span className="font-semibold">{selectedNode.metrics?.uptime_pct?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Z-Score:</span>
                <span className="font-semibold">{selectedNode.metrics?.z_score?.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-3 w-full py-1 text-center bg-[#0B0F19] text-[#94A3B8] rounded hover:text-[#E2E8F0] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#94A3B8] px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> High Performer / Sound
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /> Normal Par
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /> Critical Leak / Loss
          </span>
        </div>
        <span>Click any node to inspect telemetry</span>
      </div>
    </div>
  );
};

