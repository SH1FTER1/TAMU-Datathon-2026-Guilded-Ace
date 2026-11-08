# PROJECT BRAIN — The Gilded Ace: Floor Command Center

> Master knowledge vault for Dashboard Royale. All column names, findings, and claims are verified against the actual parquet files.

## Section 1: Schema Quick-Reference Matrix

| Table | Folder | Rows | Key | Core Join Columns |
|---|---|---|---|---|
| prepared_daily_view | 1_prepared_views | 56,110 | machine_id, gaming_date | zone_id, bank_id, config_id, location_id |
| property_day | 1_prepared_views | 181 | gaming_date | — |
| player_period | 1_prepared_views | 148,893 | player_id, period_month | opening_tier, home_region |
| calendar_day | 2_machine_decision | 181 | gaming_date | scheduled_seconds |
| machines | 2_machine_decision | 310 | machine_id | manufacturer, theme, lease_class |
| placements | 2_machine_decision | 314 | placement_id | machine_id, location_id, config_id |
| floor_locations | 2_machine_decision | 378 | location_id | zone_id, bank_id, x_m, y_m, node_type |
| floor_walkways | 2_machine_decision | 10 | walkway_id | zone_a, zone_b |
| game_math | 2_machine_decision | 10 | config_id | configured_rtp, payout_multiplier_variance, volatility_class |
| action_catalog | 2_machine_decision | 13 | action_type_id | unit_cost_cents, recurring_cost_cents_per_day, lead_days, quantity_limit |
| operations | 2_machine_decision | 1,226 | operation_id | machine_id, event_type |
| cost_rules | 2_machine_decision | 9 | cost_rule_id | entity_type, cost_category |
| loyalty_ledger | 3_guests | 782,773 | loyalty_event_id | player_id, event_type, points_delta |
| fnb_transactions | 3_guests | 227,833 | transaction_id | player_id, outlet_id, comp_id |
| zone_traffic_hourly | 4_context | 30,401 | sensor_id, hour_start_utc | zone_id, counter_status, entries_count |
| events | 4_context | 8 | event_id | start_date, end_date, event_type |

### Key Conventions
- Gaming day: 06:00 to 06:00 local (America/Los_Angeles)
- 2025-03-08 has 82,800 scheduled_seconds (23h, DST)
- Money: `_cents` = integer cents; `_usd` = dollars
- Off-floor: 1,018 rows have active=FALSE or location_id IS NULL — always exclude
- comp_cost_usd is ALREADY INSIDE linked_pos_cogs_usd — never subtract both
- Ratios from sums, never averaged ratios

## Section 2: Automated Data Audit Findings

### GM's Naive Bottom 10 (by raw SUM house_win_usd)
[TBD - run audit script]

### True Bottom 10 (by SUM(theo_usd) / SUM(available_hours))
[TBD - run audit script]

### Machines That Moved (placements with multiple location_ids)
[TBD - run audit script]

### Payout Leak Test (Z < -2.58)
[TBD - run audit script]

### Loyalty Comp Program Shift
[TBD - run audit script]

### Holdout Validation MAE
[TBD - run audit script]

## Section 3: Claims & Evidence Ledger

### Claim 1: The GM's "worst machines" list is misleading
- **Table/Query**: prepared_daily_view aggregated by machine_id
- **Statistical Result**: [TBD]
- **Competing Explanation Tested**: Low house_win could be unlucky (Z-score within ±1.96) vs. true structural underperformance (low theo/avail hour)
- **Limitation**: Only 6 months of data; some machines have low exposure

### Claim 2: Downtime is a bigger profit leak than bad game selection
- **Table/Query**: operations + prepared_daily_view (available_hours vs scheduled_hours)
- **Statistical Result**: [TBD]
- **Competing Explanation Tested**: Downtime opportunity cost vs. game mix optimization
- **Limitation**: Repair costs are partial (no full staffing costs)

### Claim 3: The comp program changed mid-period
- **Table/Query**: loyalty_ledger + player_period across months
- **Statistical Result**: [TBD]
- **Competing Explanation Tested**: Seasonal variation vs. policy change
- **Limitation**: Tracked play only; uncarded guests invisible

### Claim 4: Time-series forecast beats naive baselines
- **Table/Query**: property_day train (Jan-Apr) vs holdout (May-Jun)
- **Statistical Result**: [TBD]
- **Competing Explanation Tested**: Constant mean vs weekday mean vs lagged regression
- **Limitation**: Only 2 months holdout; no exogenous shocks guaranteed

### DEV.to Story Hooks
1. "Your casino GM is firing the wrong machines" — the luck-vs-leak revelation
2. "82,800 seconds broke my dashboard" — the DST trap in gaming analytics
3. "Monte Carlo meets the one-armed bandit" — simulating ROI uncertainty for floor actions
