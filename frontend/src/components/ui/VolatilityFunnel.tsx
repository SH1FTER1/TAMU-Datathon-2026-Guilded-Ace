import React from 'react';
import { VolatilityPoint } from '../../types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface VolatilityFunnelProps {
  points: VolatilityPoint[];
}

export const VolatilityFunnel: React.FC<VolatilityFunnelProps> = ({ points }) => {
  return (
    <div className="bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-bold text-[#D4AF37]">
              Volatility Confidence Funnel (Luck vs. Leak Z-Score)
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Separates random gaming variance (|Z| ≤ 1.96) from true firmware/payout leaks (Z &lt; -2.58)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#F43F5E]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /> True Leak (Z &lt; -2.58)
          </span>
          <span className="flex items-center gap-1.5 text-[#10B981]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> High Hold (Z &gt; +2.58)
          </span>
          <span className="flex items-center gap-1.5 text-[#94A3B8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" /> Normal Luck
          </span>
        </div>
      </div>

      {/* Recharts Scatter Chart */}
      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="coin_in_usd"
              name="Exposure"
              tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
              stroke="#94A3B8"
              fontSize={11}
              domain={['auto', 'auto']}
              label={{ value: 'Coin-In Exposure ($)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="hold_deviation_pct"
              name="Hold Deviation"
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
              stroke="#94A3B8"
              fontSize={11}
              domain={[-6, 6]}
              label={{ value: 'Observed - Theoretical Hold (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as VolatilityPoint;
                  return (
                    <div className="bg-[#0B0F19] border border-[#D4AF37] rounded-xl p-3 shadow-2xl text-xs space-y-1">
                      <div className="font-bold text-[#D4AF37]">{data.machine_id} - {data.theme}</div>
                      <div className="text-[#E2E8F0]">Coin-In: {formatCurrency(data.coin_in_usd)}</div>
                      <div className="text-[#E2E8F0]">Hold Deviation: {data.hold_deviation_pct > 0 ? '+' : ''}{data.hold_deviation_pct.toFixed(2)}%</div>
                      <div className={`font-semibold ${data.z_score < -2.58 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
                        Z-Score: {data.z_score.toFixed(2)} ({data.status.toUpperCase()})
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">Paid Spins: {data.spins.toLocaleString()}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#D4AF37" strokeDasharray="2 2" strokeWidth={1.5} />
            <ReferenceLine y={-1.96} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: '-95% Conf', fill: '#F59E0B', fontSize: 10 }} />
            <ReferenceLine y={1.96} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: '+95% Conf', fill: '#F59E0B', fontSize: 10 }} />
            <ReferenceLine y={-2.58} stroke="#F43F5E" strokeDasharray="2 2" label={{ value: '-99% Leak', fill: '#F43F5E', fontSize: 10 }} />
            <Scatter
              name="Machines"
              data={points}
              fill="#D4AF37"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                let color = '#64748B';
                if (payload.z_score < -2.58) color = '#F43F5E';
                else if (payload.z_score > 2.58) color = '#10B981';
                return <circle cx={cx} cy={cy} r={payload.z_score < -2.58 ? 6 : 4} fill={color} stroke="#0B0F19" strokeWidth={1} />;
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 p-2.5 rounded-lg bg-[#0B0F19]/60 border border-[#1E293B] flex items-center gap-2 text-xs text-[#94A3B8]">
        <AlertCircle className="w-4 h-4 text-[#F43F5E] shrink-0" />
        <span>
          <strong className="text-[#E2E8F0]">Critical Finding:</strong> Machine <code className="text-[#F43F5E] font-bold">M-1158</code> (Desert Gold) lands far below the -99% boundary with <strong className="text-[#F43F5E]">Z = -4.05</strong>, validating a persistent firmware payout leak rather than bad luck.
        </span>
      </div>
    </div>
  );
};

