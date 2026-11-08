import React, { useState, useEffect } from 'react';
import {
  FilterOptions,
  KPIResponse,
  TriageResponse,
  DemandEconomicsResponse,
  ValidationResponse,
  ActionItem,
} from './types';
import { formatCurrency, formatPercent } from './lib/utils';
import { AnimatedTabs, TabItem } from './components/ui/AnimatedTabs';
import { BentoMetricCard } from './components/ui/BentoMetricCard';
import { CommandFilterBar } from './components/ui/CommandFilterBar';
import { TriageTableCard } from './components/ui/TriageTableCard';
import { FloorMap } from './components/ui/FloorMap';
import { VolatilityFunnel } from './components/ui/VolatilityFunnel';
import { TabDemand } from './components/tabs/TabDemand';
import { TabValidation } from './components/tabs/TabValidation';
import { TabBudget } from './components/tabs/TabBudget';

import {
  Coins,
  TrendingUp,
  Percent,
  Sparkles,
  Layers,
  BarChart3,
  BrainCircuit,
  Wallet,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('triage');

  // Filters State
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('full');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);

  // Data States
  const [kpis, setKpis] = useState<KPIResponse | null>(null);
  const [triageData, setTriageData] = useState<TriageResponse | null>(null);
  const [demandData, setDemandData] = useState<DemandEconomicsResponse | null>(null);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [catalog, setCatalog] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Filter Options & Catalog on Mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const [filtersRes, catRes] = await Promise.all([
          fetch('/api/filters').then((r) => r.json()),
          fetch('/api/action-catalog').then((r) => r.json()),
        ]);
        setFilters(filtersRes);
        setCatalog(catRes);
      } catch (err) {
        console.error('Error loading filter metadata', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch Core Data when Filters change
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const preset = filters?.presets.find((p) => p.id === selectedPreset);
        const start = preset?.start || '2025-01-01';
        const end = preset?.end || '2025-06-30';

        const params = new URLSearchParams();
        params.append('start_date', start);
        params.append('end_date', end);
        selectedZones.forEach((z) => params.append('zones', z));
        selectedBanks.forEach((b) => params.append('banks', b));
        selectedManufacturers.forEach((m) => params.append('manufacturers', m));

        const [kpiRes, triageRes, demandRes, valRes] = await Promise.all([
          fetch(`/api/kpis?${params}`).then((r) => r.json()),
          fetch(`/api/triage?${params}`).then((r) => r.json()),
          fetch(`/api/demand-economics?${params}`).then((r) => r.json()),
          fetch('/api/validation').then((r) => r.json()),
        ]);

        setKpis(kpiRes);
        setTriageData(triageRes);
        setDemandData(demandRes);
        setValidationData(valRes);
      } catch (err) {
        console.error('Error fetching dashboard telemetry', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (filters) {
      fetchData();
    }
  }, [filters, selectedPreset, selectedZones, selectedBanks, selectedManufacturers]);

  const handleResetFilters = () => {
    setSelectedPreset('full');
    setSelectedZones([]);
    setSelectedBanks([]);
    setSelectedManufacturers([]);
  };

  const tabs: TabItem[] = [
    { id: 'triage', label: 'Floor Map & Machine Triage', icon: <Layers className="w-4 h-4" /> },
    { id: 'demand', label: 'Demand, Downtime & Comps', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'validation', label: 'Time-Series Validation Lab', icon: <BrainCircuit className="w-4 h-4" />, badge: '$52.8k MAE' },
    { id: 'budget', label: '$100K Budget War Room', icon: <Wallet className="w-4 h-4" />, badge: 'Monte Carlo' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] p-4 lg:p-8 space-y-6">
      {/* Brand Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-[#0B0F19] font-black text-xl shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              ♠
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#D4AF37] tracking-tight">
                The Gilded Ace: Floor Command Center
              </h1>
              <p className="text-xs text-[#94A3B8] font-medium">
                Autonomous Floor Intelligence, Empirical Bayes Shrinkage & Capital ROI Simulator
              </p>
            </div>
          </div>
        </div>

        {/* Global Status Pills */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" /> Live DuckDB Parquet Feed
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
            21st.dev MCP Remodeled
          </span>
        </div>
      </div>

      {/* Sleek Command Filter Popover Bar */}
      <CommandFilterBar
        filters={filters}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
        selectedZones={selectedZones}
        onChangeZones={setSelectedZones}
        selectedBanks={selectedBanks}
        onChangeBanks={setSelectedBanks}
        selectedManufacturers={selectedManufacturers}
        onChangeManufacturers={setSelectedManufacturers}
        onReset={handleResetFilters}
      />

      {/* Executive Bento KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <BentoMetricCard
          title="Total Coin-In (Exposure)"
          value={formatCurrency(kpis?.total_coin_in)}
          subValue="All paid wagers incl. replay"
          subtitle="Denominator Baseline"
          icon={<Coins className="w-4 h-4" />}
          badge={{ label: 'Wager Baseline', variant: 'gold' }}
        />
        <BentoMetricCard
          title="Actual House Win"
          value={formatCurrency(kpis?.actual_house_win)}
          subValue={`Observed Hold: ${kpis?.observed_hold_pct.toFixed(2)}%`}
          subtitle="Net Casino Take"
          icon={<TrendingUp className="w-4 h-4" />}
          badge={{ label: 'Realized Revenue', variant: 'emerald' }}
        />
        <BentoMetricCard
          title="Theoretical Par Win"
          value={formatCurrency(kpis?.theo_win)}
          subValue={`Configured Par: ${kpis?.theo_hold_pct.toFixed(2)}%`}
          subtitle="RTP Exposure Par"
          icon={<Percent className="w-4 h-4" />}
          badge={{ label: 'Expected Par', variant: 'gold' }}
        />
        <BentoMetricCard
          title="Luck Variance"
          value={formatCurrency(kpis?.luck_residual)}
          subValue={`Deviation: ${kpis?.luck_residual_pct !== undefined && kpis?.luck_residual_pct > 0 ? '+' : ''}${kpis?.luck_residual_pct?.toFixed(2)}%`}
          subtitle="House Win - Theo Par"
          icon={<Sparkles className="w-4 h-4" />}
          badge={{
            label: kpis && kpis.luck_residual >= 0 ? 'Lucky House' : 'Patron Upside',
            variant: kpis && kpis.luck_residual >= 0 ? 'emerald' : 'amber',
          }}
        />
        <BentoMetricCard
          title="Floor Utilization"
          value={`${kpis?.active_machines || 309} Active`}
          subValue={`${kpis?.target_machines || 300} Target Layout`}
          subtitle="DST Safe Seconds"
          icon={<ShieldCheck className="w-4 h-4" />}
          badge={{ label: '99.1% Deployed', variant: 'cyan' }}
        />
      </div>

      {/* Animated 21st.dev Tab Navigation */}
      <AnimatedTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#D4AF37]">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm font-semibold">Crunching Floor Telemetry with DuckDB...</span>
        </div>
      ) : (
        <div>
          {activeTab === 'triage' && (
            <div className="space-y-6">
              {/* Above the Fold: Side-by-Side Triage Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TriageTableCard
                  title="GM's Naive Bottom 10 (Raw House Win)"
                  subtitle="Misleading triage: Flags sound machines suffering short-term luck variance"
                  records={triageData?.naive_bottom_10 || []}
                  isTrueBottom={false}
                />
                <TriageTableCard
                  title="True Bottom 10 (Theo / Available Hr)"
                  subtitle="Mathematically sound: Isolates low demand and catastrophic firmware leaks"
                  records={triageData?.true_bottom_10 || []}
                  isTrueBottom={true}
                />
              </div>

              {/* Below Tables: Interactive 2D Floor Blueprint + Volatility Funnel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FloorMap
                  nodes={triageData?.floor_map?.nodes || []}
                  walkways={triageData?.floor_map?.walkways || []}
                />
                <VolatilityFunnel points={triageData?.volatility_funnel || []} />
              </div>
            </div>
          )}

          {activeTab === 'demand' && <TabDemand data={demandData} />}
          {activeTab === 'validation' && <TabValidation data={validationData} />}
          {activeTab === 'budget' && <TabBudget catalog={catalog} />}
        </div>
      )}
    </div>
  );
}

export default App;
