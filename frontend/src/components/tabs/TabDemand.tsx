import React from 'react';
import { DemandEconomicsResponse } from '../../types';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, Users, Wrench, Gift, AlertTriangle } from 'lucide-react';

interface TabDemandProps {
  data: DemandEconomicsResponse | null;
}

export const TabDemand: React.FC<TabDemandProps> = ({ data }) => {
  if (!data) return <div className="text-center py-12 text-[#94A3B8]">Loading Demand & Economics...</div>;

  return (
    <div className="space-y-6">
      {/* 1. Macro Demand Timeline */}
      <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-base font-bold text-[#D4AF37]">
                Macro Demand Timeline (Daily Coin-In vs. House Win)
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Daily wagers across 181 gaming days with major Las Vegas event catalyst overlays
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
              CES • Super Bowl • EDC
            </span>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.demand_timeline} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="coinInGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-[#0B0F19] border border-[#D4AF37] rounded-xl p-3 shadow-2xl text-xs space-y-1">
                        <div className="font-bold text-[#D4AF37]">{row.date} ({row.weekday})</div>
                        <div className="text-[#E2E8F0]">Coin-In: {formatCurrency(row.coin_in_usd)}</div>
                        <div className="text-[#10B981]">House Win: {formatCurrency(row.house_win_usd)}</div>
                        <div className="text-[#06B6D4]">Theo: {formatCurrency(row.theo_usd)}</div>
                        {row.events_active && (
                          <div className="text-[#F59E0B] font-semibold pt-1 border-t border-[#1E293B]">
                            Event: {row.events_active}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="coin_in_usd" name="Coin-In" stroke="#D4AF37" fill="url(#coinInGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="house_win_usd" name="House Win" stroke="#10B981" fill="url(#winGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Side-by-Side: Downtime Costs vs Player Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Downtime Opportunity Cost */}
        <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#F97316]" />
                <h3 className="text-base font-bold text-[#D4AF37]">Downtime Opportunity Cost by Manufacturer</h3>
              </div>
              <p className="text-xs text-[#94A3B8]">Total lost available hours and direct ticket expenses</p>
            </div>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.downtime_breakdown} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis dataKey="manufacturer" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F19] border border-[#F97316] rounded-xl p-3 shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-[#D4AF37]">{d.manufacturer}</div>
                          <div className="text-[#E2E8F0]">Event Type: {d.event_type}</div>
                          <div className="text-[#F97316] font-semibold">Lost Hours: {d.lost_hours} hrs</div>
                          <div className="text-[#94A3B8]">Total Events: {d.total_events} tickets</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="lost_hours" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F19]/60 border border-[#1E293B] flex items-center gap-2 text-xs text-[#94A3B8]">
            <AlertTriangle className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>
              <strong className="text-[#E2E8F0]">Ridgeline Gaming</strong> generates 680 fault tickets and over 2,700 hours of outage—representing the single largest mechanical profit leak on the floor.
            </span>
          </div>
        </div>

        {/* Player Lorenz Curve */}
        <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="text-base font-bold text-[#D4AF37]">
                  Player Concentration (Gini: {data.gini_coefficient.toFixed(3)})
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8]">Cumulative distribution of carded coin-in across enrolled guests</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
              Top 20% = 84% Play
            </span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.lorenz_curve} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis dataKey="pop_pct" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F19] border border-[#06B6D4] rounded-xl p-3 shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-[#06B6D4]">{d.pop_pct}% of Players</div>
                          <div className="text-[#E2E8F0]">Generate: {d.wealth_pct}% of Coin-In</div>
                          <div className="text-[#94A3B8]">Equality Line: {d.equality_pct}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="equality_pct" stroke="#64748B" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                <Line type="monotone" dataKey="wealth_pct" stroke="#06B6D4" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F19]/60 border border-[#1E293B] text-xs text-[#94A3B8]">
            <strong className="text-[#E2E8F0]">Extreme Concentration:</strong> The Gini coefficient of 0.754 proves VIP tier retention is paramount—a small cohort of Diamond/Platinum patrons drives the vast majority of gaming handle.
          </div>
        </div>
      </div>

      {/* 3. Comp Reinvestment Regime Drift */}
      <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-base font-bold text-[#D4AF37]">
                Comp Reinvestment Inflation Tracker (+18.9% Drift)
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Monthly ratio of redeemed comp cost to theoretical win reveals mid-year reward budget escalation
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            1.11% (Jan) → 1.32% (Jun)
          </span>
        </div>

        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.comp_trend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0B0F19] border border-[#F59E0B] rounded-xl p-3 shadow-2xl text-xs space-y-1">
                        <div className="font-bold text-[#D4AF37]">{d.month}</div>
                        <div className="text-[#E2E8F0]">Theo Win: {formatCurrency(d.total_theo_usd)}</div>
                        <div className="text-[#F59E0B]">Comp Cost: {formatCurrency(d.total_comp_cost_usd)}</div>
                        <div className="text-[#10B981] font-semibold">
                          Reinvestment Rate: {d.comp_to_theo_pct.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total_comp_cost_usd" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

