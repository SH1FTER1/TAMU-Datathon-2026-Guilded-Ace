---
name: casino-analytics-rules
description: "Enforces Dashboard Royale casino math, DuckDB SQL hygiene, and statistical validation rules"
---

# Casino Analytics Rules

## Core Tables Schema Reference

### prepared_daily_view (56,110 rows) — Key: machine_id, gaming_date
| Column | Type |
|---|---|
| machine_id | VARCHAR |
| gaming_date | DATE |
| month | VARCHAR |
| local_weekday | VARCHAR |
| is_weekend | BOOLEAN |
| federal_holiday | VARCHAR |
| events_active | VARCHAR |
| zone_id | VARCHAR |
| zone_name | VARCHAR |
| bank_id | VARCHAR |
| location_id | VARCHAR |
| config_id | VARCHAR |
| theme | VARCHAR |
| configured_rtp | DECIMAL(10,8) |
| volatility_class | VARCHAR |
| manufacturer | VARCHAR |
| lease_class | VARCHAR |
| active | BOOLEAN |
| meter_status | VARCHAR |
| available_hours | DOUBLE |
| occupied_hours | DOUBLE |
| availability_ratio | DOUBLE |
| occupancy_ratio | DOUBLE |
| paid_spins | BIGINT |
| coin_in_usd | DECIMAL(18,2) |
| payout_usd | DECIMAL(18,2) |
| house_win_usd | DECIMAL(18,2) |
| theo_usd | DECIMAL(18,4) |
| observed_hold | DOUBLE |
| theo_hold | DOUBLE |
| luck_residual_usd | DECIMAL(18,4) |
| carded_coin_in_usd | DECIMAL(18,2) |
| carded_share | DOUBLE |
| faults_opened | BIGINT |
| zone_entries_observed | BIGINT |
| zone_counter_coverage_hours | DOUBLE |
| lease_cost_usd | DECIMAL(18,2) |
| service_cost_usd | DECIMAL(18,2) |
| power_cost_usd | DECIMAL(18,2) |
| repair_cost_usd | DECIMAL(18,2) |
| contribution_after_supplied_costs_usd | DECIMAL(18,2) |
| lag_coin_in_7d_mean_usd | DOUBLE |
| lag_downtime_7d_hours | DOUBLE |
| lag_house_win_28d_usd | DOUBLE |

### property_day (181 rows) — Key: gaming_date
Columns: gaming_date (DATE), local_weekday (VARCHAR), events_active (VARCHAR), active_machines (BIGINT), coin_in_usd (DECIMAL(18,2)), payout_usd (DECIMAL(18,2)), house_win_usd (DECIMAL(18,2)), theo_usd (DECIMAL(18,4)), observed_hold (DOUBLE), available_machine_hours (DOUBLE), occupied_machine_hours (DOUBLE), carded_coin_in_share (DOUBLE), pos_cash_usd (DECIMAL(18,2)), pos_cogs_usd (DECIMAL(18,2)), comp_face_value_usd (DECIMAL(18,2)), comp_cost_usd (DECIMAL(18,2)), faults_opened (BIGINT), incidents_reported (BIGINT), entrance_zone_entries_observed (BIGINT), total_zone_entries_observed (BIGINT), counter_coverage_share (DOUBLE), machine_supplied_costs_usd (DECIMAL(18,2)), tech_labor_cost_usd (DECIMAL(18,2)), contribution_after_supplied_costs_usd (DECIMAL(18,2))

### player_period (148,893 rows) — Key: player_id, period_month
Columns: player_id (VARCHAR), period_month (VARCHAR), home_region (VARCHAR), age_band (VARCHAR), opening_tier (VARCHAR), tier_end (VARCHAR), observed_visits (BIGINT), incomplete_visits (BIGINT), sessions (BIGINT), carded_play_hours (DOUBLE), tracked_coin_in_usd (DECIMAL(18,2)), tracked_payout_usd (DECIMAL(18,2)), tracked_net_usd (DECIMAL(18,2)), theo_usd (DECIMAL(18,4)), luck_residual_usd (DECIMAL(18,4)), linked_pos_cash_usd (DECIMAL(18,2)), linked_pos_cogs_usd (DECIMAL(18,2)), comps_redeemed (BIGINT), comp_face_value_usd (DECIMAL(18,2)), comp_cost_usd (DECIMAL(18,2)), points_earned (BIGINT), points_redeemed (BIGINT), tracked_contribution_usd (DECIMAL(18,2))

### calendar_day (181 rows) — Key: gaming_date
Columns: gaming_date (DATE), gaming_day_start_utc (TIMESTAMP), gaming_day_end_utc (TIMESTAMP), scheduled_seconds (BIGINT), local_weekday (VARCHAR), utc_offset_start (VARCHAR), utc_offset_end (VARCHAR), month (VARCHAR), is_weekend (BOOLEAN), federal_holiday (VARCHAR)

### game_math (10 rows) — Key: config_id
Columns: config_id (VARCHAR), theme (VARCHAR), configured_rtp (DECIMAL(10,8)), payout_multiplier_variance (DECIMAL(18,8)), hit_probability (DECIMAL(10,6)), max_multiplier (DECIMAL(12,2)), min_bet_cents (BIGINT), max_bet_cents (BIGINT), bet_options_cents (VARCHAR), payout_increment_cents (INTEGER), volatility_class (VARCHAR)

### action_catalog (13 rows) — Key: action_type_id
Columns: action_type_id (VARCHAR), name (VARCHAR), unit (VARCHAR), unit_cost_cents (BIGINT), recurring_cost_cents_per_day (BIGINT), lead_days (INTEGER), downtime_minutes (INTEGER), quantity_limit (INTEGER), incompatibility_group (VARCHAR), notes (VARCHAR)

### machines (310 rows) — Key: machine_id
Columns: machine_id (VARCHAR), manufacturer (VARCHAR), theme (VARCHAR), install_date (DATE), retire_date (DATE), lease_class (VARCHAR)

### placements (314 rows) — Key: placement_id
Columns: placement_id (VARCHAR), machine_id (VARCHAR), location_id (VARCHAR), config_id (VARCHAR), effective_from_utc (TIMESTAMP), effective_to_utc (TIMESTAMP)

### floor_locations (378 rows) — Key: location_id
Columns: location_id (VARCHAR), parent_location_id (VARCHAR), node_type (VARCHAR), zone_id (VARCHAR), bank_id (VARCHAR), outlet_id (VARCHAR), name (VARCHAR), x_m (DOUBLE), y_m (DOUBLE), capacity (INTEGER)

### floor_walkways (10 rows) — Key: walkway_id
Columns: walkway_id (VARCHAR), zone_a (VARCHAR), zone_b (VARCHAR), length_m (DOUBLE), closed_from_utc (TIMESTAMP), closed_to_utc (TIMESTAMP), closure_reason (VARCHAR)

### operations (1,226 rows) — Key: operation_id
Columns: operation_id (VARCHAR), machine_id (VARCHAR), location_id (VARCHAR), event_type (VARCHAR), opened_at_utc (TIMESTAMP), opened_at_local (TIMESTAMP), recorded_at_utc (TIMESTAMP), work_started_at_utc (TIMESTAMP), available_at_utc (TIMESTAMP), direct_cost_cents (BIGINT)

### loyalty_ledger (782,773 rows) — Key: loyalty_event_id
Columns: loyalty_event_id (VARCHAR), player_id (VARCHAR), event_at_utc (TIMESTAMP), available_at_utc (TIMESTAMP), event_type (VARCHAR), benefit_id (VARCHAR), points_delta (BIGINT), tier_before (VARCHAR), tier_after (VARCHAR), face_value_cents (BIGINT), economic_cost_cents (BIGINT), redeemed_pos_id (VARCHAR), source_segment_id (VARCHAR)

### fnb_transactions (227,833 rows) — Key: transaction_id
Columns: transaction_id (VARCHAR), outlet_id (VARCHAR), event_at_utc (TIMESTAMP), event_at_local (TIMESTAMP), local_hour (INTEGER), utc_offset (VARCHAR), recorded_at_utc (TIMESTAMP), player_id (VARCHAR), observed_visit_id (VARCHAR), item (VARCHAR), face_value_cents (BIGINT), cash_receipt_cents (BIGINT), cogs_cents (BIGINT), comp_id (VARCHAR)

### zone_traffic_hourly (30,401 rows) — Key: sensor_id, hour_start_utc
Columns: sensor_id (VARCHAR), zone_id (VARCHAR), hour_start_utc (TIMESTAMP), hour_start_local (TIMESTAMP), local_hour (INTEGER), utc_offset (VARCHAR), entries_count (BIGINT), counter_status (VARCHAR), coverage_minutes (INTEGER), recorded_at_utc (TIMESTAMP)

### events (8 rows) — Key: event_id
Columns: event_id (VARCHAR), name (VARCHAR), event_type (VARCHAR), start_date (DATE), end_date (DATE), announced_date (DATE), source_type (VARCHAR), source_url (VARCHAR), local_scope (VARCHAR)

### cost_rules (9 rows) — Key: cost_rule_id
Columns: cost_rule_id (VARCHAR), entity_type (VARCHAR), entity_id (VARCHAR), cost_category (VARCHAR), calculation_basis (VARCHAR), unit (VARCHAR), payer (VARCHAR), rate (VARCHAR), effective_from (DATE), effective_to (DATE)

## Mandatory SQL Patterns

### 1. Active Floor Filtering
Always exclude off-floor rows (1,018 rows where machines were not installed or already retired):
```sql
WHERE active = TRUE AND location_id IS NOT NULL
```

### 2. Ratio-of-Sums Hold (NEVER average daily ratios)
```sql
SUM(house_win_usd) / NULLIF(SUM(coin_in_usd), 0) AS observed_hold
```

### 3. DST-Safe Availability
Join calendar_day on gaming_date to get exact scheduled_seconds:
```sql
SELECT
    d.machine_id,
    SUM(d.available_hours) AS total_available_hours,
    SUM(c.scheduled_seconds) / 3600.0 AS total_scheduled_hours,
    SUM(d.available_hours) / NULLIF(SUM(c.scheduled_seconds) / 3600.0, 0) AS availability_ratio
FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
WHERE d.active = TRUE AND d.location_id IS NOT NULL
GROUP BY d.machine_id
```
Note: 2025-03-08 has only 82,800 scheduled_seconds (23 hours) due to DST.

### 4. Luck vs. Leak Z-Score
Formula: Z = (h_obs - h_theo) / (sigma_game / sqrt(N))
Where:
- h_obs = SUM(house_win_usd) / SUM(coin_in_usd)
- h_theo = 1 - configured_rtp (from game_math)
- sigma_game = sqrt(payout_multiplier_variance) from game_math
- N = SUM(paid_spins)

Interpretation:
- |Z| <= 1.96: Normal luck variance (95% confidence)
- Z < -2.58: Anomalous payout leak (99% confidence) - INVESTIGATE
- Z > 2.58: Anomalously high hold - may indicate malfunction

```sql
WITH machine_stats AS (
    SELECT
        d.machine_id,
        d.config_id,
        SUM(d.coin_in_usd) AS total_coin_in,
        SUM(d.house_win_usd) AS total_house_win,
        SUM(d.theo_usd) AS total_theo,
        SUM(d.paid_spins) AS total_spins,
        SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0) AS obs_hold
    FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
    WHERE d.active = TRUE AND d.location_id IS NOT NULL
    GROUP BY d.machine_id, d.config_id
)
SELECT
    ms.*,
    g.configured_rtp,
    g.payout_multiplier_variance,
    (ms.obs_hold - (1.0 - g.configured_rtp)) / NULLIF(SQRT(g.payout_multiplier_variance) / NULLIF(SQRT(ms.total_spins), 0), 0) AS z_score
FROM machine_stats ms
JOIN 'data/2_machine_decision/game_math.parquet' g USING (config_id)
```

### 5. Comp & F&B Hygiene
- comp_cost_usd is ALREADY INSIDE linked_pos_cogs_usd — do NOT subtract both
- Pre-aggregate sessions and fnb_transactions BEFORE joining to machine-day
- tracked_contribution_usd = coin_in - payout + POS cash - POS cogs

### 6. 30-Day Budget Pricing Formula
For July actions with the $100,000 budget:
```python
cost_usd = quantity * (unit_cost_cents + recurring_cost_cents_per_day * max(0, 30 - lead_days)) / 100
```

### 7. Chronological Holdout Split
- Train: 2025-01-01 to 2025-04-30
- Test/Holdout: 2025-05-01 to 2025-06-30
- ZERO lookahead leakage: lag features use only past data

### 8. Empirical Bayes Shrinkage for Low-Exposure Machines
For machines with low coin-in, shrink observed hold toward the game's theoretical hold:
```python
shrinkage_weight = total_spins / (total_spins + prior_spins)
adjusted_hold = shrinkage_weight * obs_hold + (1 - shrinkage_weight) * theo_hold
```
