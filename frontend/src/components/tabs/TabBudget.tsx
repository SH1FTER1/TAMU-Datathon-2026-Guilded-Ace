import React, { useState, useEffect } from 'react';
import { ActionItem, BudgetSimulateResponse } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  Coins,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TabBudgetProps {
  catalog: ActionItem[];
}

export const TabBudget: React.FC<TabBudgetProps> = ({ catalog }) => {
  // Preset strategic allocation: Firmware Upgrade (10), Cleaning (20), Comp Pilot (1)
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'FW-UPG-01': 10,
    'CLEAN-01': 20,
    'COMP-PILOT-01': 1,
  });
  const [simData, setSimData] = useState<BudgetSimulateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openClaimId, setOpenClaimId] = useState<number | null>(1);

  const runSimulation = async (currentQuantities: Record<string, number>) => {
    setIsLoading(true);
    try {
      const actions = Object.entries(currentQuantities)
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => ({ action_type_id: id, quantity: q }));

      const res = await fetch('/api/budget-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      });
      const data = await res.json();
      setSimData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(quantities);
  }, []);

  const handleQuantityChange = (id: string, val: number) => {
    const next = { ...quantities, [id]: val };
    setQuantities(next);
  };

  const handleApplyPreset = (presetName: string) => {
    let next: Record<string, number> = {};
    if (presetName === 'uptime') {
      next = { 'FW-UPG-01': 15, 'RETUNE-01': 10 };
    } else if (presetName === 'marketing') {
      next = { 'SIGN-01': 15, 'THEME-SWAP-01': 3 };
    } else {
      // Balanced default
      next = { 'FW-UPG-01': 10, 'CLEAN-01': 20, 'COMP-PILOT-01': 1 };
    }
    setQuantities(next);
    runSimulation(next);
  };

  const totalCost = simData?.total_cost_usd || 0;
  const budgetRemaining = simData?.budget_remaining || 100_000 - totalCost;
  const isExceeded = totalCost > 100_000;
  const p50Net = simData?.monte_carlo?.p50_net_profit || 0;
  const p10Net = simData?.monte_carlo?.p10_net_profit || 0;
  const p90Net = simData?.monte_carlo?.p90_net_profit || 0;
  const p50Roi = simData?.monte_carlo?.p50_roi_pct || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Budget Progress HUD */}
      <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-bold text-[#D4AF37]">
                $100,000 Capital Allocation War Room (Judge Stress Test #4)
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              30-day July implementation horizon enforcing lead-day deduction formula:{' '}
              <code className="text-[#D4AF37]">
                cost = qty × [unit_cost + daily_cost × max(0, 30 - lead_days)]
              </code>
            </p>
          </div>

          {/* Strategy Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8] font-semibold">PRESETS:</span>
            <button
              onClick={() => handleApplyPreset('balanced')}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0B0F19] text-[#E2E8F0] border border-[#1E293B] hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              Balanced
            </button>
            <button
              onClick={() => handleApplyPreset('uptime')}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0B0F19] text-[#E2E8F0] border border-[#1E293B] hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              Max Uptime
            </button>
            <button
              onClick={() => handleApplyPreset('marketing')}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0B0F19] text-[#E2E8F0] border border-[#1E293B] hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              Signage/Refresh
            </button>
          </div>
        </div>

        {/* Budget Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#E2E8F0]">
              Total Allocated:{' '}
              <strong className={isExceeded ? 'text-[#F43F5E]' : 'text-[#D4AF37]'}>
                {formatCurrency(totalCost)}
              </strong>{' '}
              / $100,000
            </span>
            <span className={budgetRemaining < 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}>
              Remaining: {formatCurrency(budgetRemaining)}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#0B0F19] overflow-hidden border border-[#1E293B]">
            <div
              className={`h-full transition-all duration-300 ${
                isExceeded ? 'bg-[#F43F5E]' : 'bg-gradient-to-r from-[#D4AF37] to-[#10B981]'
              }`}
              style={{ width: `${Math.min(100, (totalCost / 100_000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Action Allocator Table & Monte Carlo Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocator Table */}
        <div className="lg:col-span-2 bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              Available Action Catalog (Select up to 3)
            </h4>
            <button
              onClick={() => runSimulation(quantities)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0B0F19] hover:bg-[#b89528] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Portfolio</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px]">
                  <th className="pb-2 font-semibold">Action ID</th>
                  <th className="pb-2 font-semibold">Name</th>
                  <th className="pb-2 font-semibold text-center">Lead Days</th>
                  <th className="pb-2 font-semibold text-right">Unit Cost</th>
                  <th className="pb-2 font-semibold text-right">Daily Cost</th>
                  <th className="pb-2 font-semibold text-center">Limit</th>
                  <th className="pb-2 font-semibold text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/40">
                {catalog.slice(0, 8).map((act) => {
                  const qty = quantities[act.action_type_id] || 0;
                  return (
                    <tr key={act.action_type_id} className="hover:bg-[#1E293B]/30 transition-colors">
                      <td className="py-2.5 font-bold text-[#D4AF37]">{act.action_type_id}</td>
                      <td className="py-2.5 text-[#E2E8F0] font-medium truncate max-w-[150px]">
                        {act.name}
                      </td>
                      <td className="py-2.5 text-center text-[#94A3B8]">{act.lead_days}d</td>
                      <td className="py-2.5 text-right text-[#E2E8F0]">
                        ${(act.unit_cost_cents / 100).toFixed(0)}
                      </td>
                      <td className="py-2.5 text-right text-[#94A3B8]">
                        ${(act.recurring_cost_cents_per_day / 100).toFixed(0)}/d
                      </td>
                      <td className="py-2.5 text-center text-[#94A3B8]">{act.quantity_limit}</td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          min="0"
                          max={act.quantity_limit}
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(act.action_type_id, parseInt(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 bg-[#0B0F19] border border-[#1E293B] rounded text-right font-bold text-[#E2E8F0] focus:border-[#D4AF37] focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monte Carlo Results Panel */}
        <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
              5,000-Draw Monte Carlo ROI Risk
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F19]/80 border border-[#10B981]/30">
                <div className="text-xs text-[#94A3B8] uppercase font-semibold">P50 Expected Net Profit</div>
                <div className="text-2xl font-extrabold text-[#10B981] mt-1">
                  {formatCurrency(p50Net)}
                </div>
                <div className="text-xs text-[#10B981] font-semibold mt-0.5">
                  Expected ROI: {p50Roi.toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1E293B]">
                  <div className="text-[11px] text-[#94A3B8]">P10 Conservative ($)</div>
                  <div className="text-sm font-bold text-[#E2E8F0] mt-1">{formatCurrency(p10Net)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1E293B]">
                  <div className="text-[11px] text-[#94A3B8]">P90 Upside ($)</div>
                  <div className="text-sm font-bold text-[#D4AF37] mt-1">{formatCurrency(p90Net)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] text-[11px] text-[#94A3B8]">
            Simulates machine lift, downtime during deployment, and execution friction across 30 days.
          </div>
        </div>
      </div>

      {/* 3. Claims & Evidence Ledger Drawer */}
      <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4">
          Claims & Evidence Appendix (Copy-Ready for Devpost / DEV.to)
        </h4>

        <div className="space-y-3">
          {simData?.claims?.map((item) => {
            const isOpen = openClaimId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#1E293B] bg-[#0B0F19]/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenClaimId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-[#E2E8F0] hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold">
                      {item.id}
                    </span>
                    <span>{item.claim}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#D4AF37]" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs space-y-2 border-t border-[#1E293B]/60 text-[#94A3B8]">
                    <div>
                      <strong className="text-[#E2E8F0]">Query / Evidence:</strong>{' '}
                      <code className="text-[#D4AF37]">{item.table_query}</code>
                    </div>
                    <div>
                      <strong className="text-[#E2E8F0]">Statistical Finding:</strong>{' '}
                      <span className="text-[#10B981]">{item.statistical_result}</span>
                    </div>
                    <div>
                      <strong className="text-[#E2E8F0]">Competing Explanation Tested:</strong>{' '}
                      <span>{item.competing_explanation}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] italic">
                      <strong>Limitation:</strong> {item.limitation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
