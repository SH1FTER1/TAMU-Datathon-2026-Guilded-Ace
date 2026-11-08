export interface FilterOptions {
  zones: string[];
  banks: string[];
  manufacturers: string[];
  guest_tiers: string[];
  home_regions: string[];
  presets: Array<{ id: string; label: string; start: string; end: string }>;
}

export interface KPIResponse {
  total_coin_in: number;
  actual_house_win: number;
  observed_hold_pct: number;
  theo_win: number;
  theo_hold_pct: number;
  luck_residual: number;
  luck_residual_pct: number;
  active_machines: number;
  target_machines: number;
}

export interface TriageBadge {
  type: 'leak' | 'downtime' | 'demand' | 'unlucky';
  label: string;
  color: string;
  icon: string;
}

export interface MachineTriageRecord {
  machine_id: string;
  theme: string;
  manufacturer: string;
  zone_name: string;
  house_win_usd: number;
  theo_usd: number;
  theo_per_avail_hour: number;
  availability_pct: number;
  observed_hold_pct: number;
  z_score: number;
  badge: TriageBadge;
}

export interface FloorNode {
  location_id: string;
  machine_id?: string;
  theme?: string;
  manufacturer?: string;
  node_type: string;
  zone_id: string;
  bank_id?: string;
  x_m: number;
  y_m: number;
  capacity?: number;
  metrics: {
    house_win: number;
    theo_win: number;
    theo_per_hr: number;
    uptime_pct: number;
    coin_in: number;
    z_score: number;
  };
}

export interface Walkway {
  walkway_id: string;
  zone_a: string;
  zone_b: string;
  length_m: number;
  is_closed: boolean;
  closure_reason: string;
}

export interface VolatilityPoint {
  machine_id: string;
  theme: string;
  coin_in_usd: number;
  hold_deviation_pct: number;
  z_score: number;
  spins: number;
  status: 'leak' | 'high' | 'normal';
}

export interface TriageResponse {
  naive_bottom_10: MachineTriageRecord[];
  true_bottom_10: MachineTriageRecord[];
  floor_map: {
    nodes: FloorNode[];
    walkways: Walkway[];
  };
  volatility_funnel: VolatilityPoint[];
}

export interface DemandEconomicsResponse {
  demand_timeline: Array<{
    date: string;
    weekday: string;
    coin_in_usd: number;
    house_win_usd: number;
    theo_usd: number;
    active_machines: number;
    events_active?: string;
  }>;
  events: Array<{
    event_id: string;
    name: string;
    event_type: string;
    start_date: string;
    end_date: string;
    local_scope: string;
  }>;
  zone_traffic: Array<{
    date: string;
    zone_id: string;
    entries: number;
    valid_hours: number;
  }>;
  downtime_breakdown: Array<{
    manufacturer: string;
    event_type: string;
    total_events: number;
    lost_hours: number;
    direct_repair_cost_usd: number;
  }>;
  player_tiers: Array<{
    opening_tier: string;
    player_count: number;
    total_coin_in_usd: number;
    total_house_win_usd: number;
    total_theo_usd: number;
    comp_cost_usd: number;
  }>;
  lorenz_curve: Array<{
    pop_pct: number;
    wealth_pct: number;
    equality_pct: number;
  }>;
  gini_coefficient: number;
  comp_trend: Array<{
    month: string;
    total_theo_usd: number;
    total_comp_cost_usd: number;
    comp_to_theo_pct: number;
    active_players: number;
  }>;
}

export interface ValidationResponse {
  metrics: {
    constant_mean_mae: number;
    weekday_mean_mae: number;
    gradient_boost_mae: number;
    improvement_pct: number;
  };
  series: Array<{
    date: string;
    actual: number;
    constant_mean: number;
    weekday_mean: number;
    gradient_boost: number;
  }>;
  residuals: number[];
  training_days: number;
  test_days: number;
}

export interface ActionItem {
  action_type_id: string;
  name: string;
  unit: string;
  unit_cost_cents: number;
  recurring_cost_cents_per_day: number;
  lead_days: number;
  downtime_minutes: number;
  quantity_limit: number;
  incompatibility_group?: string;
  notes?: string;
}

export interface BudgetSimulateResponse {
  total_cost_usd: number;
  budget_remaining: number;
  is_valid: boolean;
  error?: string;
  actions: Array<{
    action_type_id: string;
    name: string;
    quantity: number;
    unit: string;
    lead_days: number;
    active_days: number;
    cost_usd: number;
  }>;
  monte_carlo: {
    p10_net_profit: number;
    p50_net_profit: number;
    p90_net_profit: number;
    p50_roi_pct: number;
    distribution: number[];
  };
  claims: Array<{
    id: number;
    claim: string;
    table_query: string;
    statistical_result: string;
    competing_explanation: string;
    limitation: string;
  }>;
}

