import React from 'react';
import { MachineTriageRecord } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { AlertTriangle, Wrench, Shuffle, ShieldCheck } from 'lucide-react';

interface TriageTableCardProps {
  title: string;
  subtitle: string;
  records: MachineTriageRecord[];
  isTrueBottom?: boolean;
}

export const TriageTableCard: React.FC<TriageTableCardProps> = ({
  title,
  subtitle,
  records,
  isTrueBottom = false,
}) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'leak':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'downtime':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'demand':
        return <Shuffle className="w-3.5 h-3.5" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'leak':
        return 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]/40 animate-pulse';
      case 'downtime':
        return 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/40';
      case 'demand':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
      default:
        return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40';
    }
  };

  return (
    <div className="flex-1 bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-[#D4AF37] tracking-tight">{title}</h3>
            <p className="text-xs text-[#94A3B8]">{subtitle}</p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#0B0F19] text-[#E2E8F0] border border-[#1E293B]">
            {records.length} Machines
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider">
                <th className="pb-2 font-semibold">Machine</th>
                <th className="pb-2 font-semibold">Theme</th>
                <th className="pb-2 font-semibold text-right">House Win</th>
                <th className="pb-2 font-semibold text-right">
                  {isTrueBottom ? 'Theo / Avail Hr' : 'Theo Win'}
                </th>
                <th className="pb-2 font-semibold text-center">Uptime</th>
                <th className="pb-2 font-semibold text-center">Z-Score</th>
                <th className="pb-2 font-semibold text-right">Action Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {records.map((r) => {
                const isSevereLeak = r.z_score < -2.58;
                return (
                  <tr
                    key={r.machine_id}
                    className={`hover:bg-[#1E293B]/40 transition-colors ${
                      isSevereLeak ? 'bg-[#F43F5E]/5' : ''
                    }`}
                  >
                    <td className="py-2.5 font-bold text-[#E2E8F0]">{r.machine_id}</td>
                    <td className="py-2.5 text-[#94A3B8] truncate max-w-[130px]">
                      <span className="text-[#E2E8F0] font-medium block truncate">{r.theme}</span>
                      <span className="text-[10px] text-[#94A3B8]">{r.manufacturer}</span>
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold ${
                        r.house_win_usd < 0 ? 'text-[#F43F5E]' : 'text-[#E2E8F0]'
                      }`}
                    >
                      {formatCurrency(r.house_win_usd)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-[#10B981]">
                      {isTrueBottom
                        ? `$${r.theo_per_avail_hour.toFixed(2)}/hr`
                        : formatCurrency(r.theo_usd)}
                    </td>
                    <td className="py-2.5 text-center text-[#E2E8F0]">
                      <span
                        className={`font-semibold ${
                          r.availability_pct < 88 ? 'text-[#F97316]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {r.availability_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          r.z_score < -2.58
                            ? 'text-[#F43F5E] bg-[#F43F5E]/20'
                            : r.z_score > 2.58
                            ? 'text-[#10B981] bg-[#10B981]/20'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {r.z_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getBadgeStyle(
                          r.badge.type
                        )}`}
                      >
                        {getBadgeIcon(r.badge.type)}
                        {r.badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

