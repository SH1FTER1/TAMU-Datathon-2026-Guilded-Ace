"""
Data audit script for Dashboard Royale.
Runs DuckDB queries to populate PROJECT_BRAIN.md with real computed numbers.
"""
import duckdb
import numpy as np

con = duckdb.connect()

DATA = 'data'
PDV = f'{DATA}/1_prepared_views/prepared_daily_view.parquet'
PROP = f'{DATA}/1_prepared_views/property_day.parquet'
PP = f'{DATA}/1_prepared_views/player_period.parquet'
CAL = f'{DATA}/2_machine_decision/calendar_day.parquet'
GM = f'{DATA}/2_machine_decision/game_math.parquet'
MACH = f'{DATA}/2_machine_decision/machines.parquet'
PLACE = f'{DATA}/2_machine_decision/placements.parquet'
OPS = f'{DATA}/2_machine_decision/operations.parquet'
LL = f'{DATA}/3_guests/loyalty_ledger.parquet'
EVENTS = f'{DATA}/4_context/events.parquet'

print("=" * 80)
print("SECTION 2: AUTOMATED DATA AUDIT FINDINGS")
print("=" * 80)

# ─── GM's Naive Bottom 10 ───
print("\n### GM's Naive Bottom 10 (by raw SUM house_win_usd)")
naive = con.execute(f"""
    SELECT 
        d.machine_id,
        m.theme,
        m.manufacturer,
        SUM(d.house_win_usd)::DOUBLE AS total_house_win,
        SUM(d.theo_usd)::DOUBLE AS total_theo,
        SUM(d.available_hours) AS total_avail_hrs,
        SUM(d.coin_in_usd)::DOUBLE AS total_coin_in,
        SUM(d.house_win_usd)::DOUBLE / NULLIF(SUM(d.coin_in_usd)::DOUBLE, 0) AS obs_hold,
        SUM(d.luck_residual_usd)::DOUBLE AS total_luck_residual
    FROM '{PDV}' d
    JOIN '{MACH}' m USING (machine_id)
    WHERE d.active = TRUE AND d.location_id IS NOT NULL
    GROUP BY d.machine_id, m.theme, m.manufacturer
    ORDER BY total_house_win ASC
    LIMIT 10
""").fetchdf()
for _, r in naive.iterrows():
    print(f"  {r['machine_id']:10s} | {r['theme']:25s} | {r['manufacturer']:15s} | HouseWin: ${r['total_house_win']:>12,.2f} | Theo: ${r['total_theo']:>10,.2f} | Luck: ${r['total_luck_residual']:>10,.2f}")

# ─── True Bottom 10 ───
print("\n### True Bottom 10 (by SUM(theo_usd) / SUM(available_hours))")
true_b10 = con.execute(f"""
    SELECT 
        d.machine_id,
        m.theme,
        m.manufacturer,
        SUM(d.theo_usd)::DOUBLE AS total_theo,
        SUM(d.available_hours) AS total_avail_hrs,
        SUM(d.theo_usd)::DOUBLE / NULLIF(SUM(d.available_hours), 0) AS theo_per_avail_hr,
        SUM(d.house_win_usd)::DOUBLE AS total_house_win,
        SUM(d.coin_in_usd)::DOUBLE AS total_coin_in
    FROM '{PDV}' d
    JOIN '{MACH}' m USING (machine_id)
    WHERE d.active = TRUE AND d.location_id IS NOT NULL
      AND SUM(d.available_hours) > 0
    GROUP BY d.machine_id, m.theme, m.manufacturer
    HAVING SUM(d.available_hours) > 100
    ORDER BY theo_per_avail_hr ASC
    LIMIT 10
""").fetchdf()
for _, r in true_b10.iterrows():
    print(f"  {r['machine_id']:10s} | {r['theme']:25s} | Theo/Hr: ${r['theo_per_avail_hr']:>8,.2f} | TotalTheo: ${r['total_theo']:>10,.2f} | Avail: {r['total_avail_hrs']:>8,.1f}h")

# ─── Overlap Check ───
naive_set = set(naive['machine_id'].tolist())
true_set = set(true_b10['machine_id'].tolist())
overlap = naive_set & true_set
print(f"\n  Overlap between Naive & True Bottom 10: {len(overlap)} machines")
if overlap:
    print(f"  Shared: {overlap}")
print(f"  Machines ONLY in Naive B10: {naive_set - true_set}")
print(f"  Machines ONLY in True B10: {true_set - naive_set}")

# ─── Machines That Moved ───
print("\n### Machines That Moved (placements with multiple locations)")
moved = con.execute(f"""
    SELECT 
        p.machine_id,
        COUNT(DISTINCT p.location_id) AS num_locations,
        MIN(p.effective_from_utc) AS first_placed,
        MAX(p.effective_to_utc) AS last_end,
        ARRAY_AGG(DISTINCT p.location_id) AS locations
    FROM '{PLACE}' p
    GROUP BY p.machine_id
    HAVING COUNT(DISTINCT p.location_id) > 1
    ORDER BY num_locations DESC
""").fetchdf()
print(f"  {len(moved)} machines had multiple placements")
for _, r in moved.iterrows():
    print(f"  {r['machine_id']:10s} | {r['num_locations']} locations: {r['locations']}")

# ─── Payout Leak Test ───
print("\n### Payout Leak Test (Z < -2.58)")
zscore_df = con.execute(f"""
    WITH machine_stats AS (
        SELECT
            d.machine_id,
            d.config_id,
            SUM(d.coin_in_usd)::DOUBLE AS total_coin_in,
            SUM(d.house_win_usd)::DOUBLE AS total_house_win,
            SUM(d.paid_spins) AS total_spins,
            SUM(d.house_win_usd)::DOUBLE / NULLIF(SUM(d.coin_in_usd)::DOUBLE, 0) AS obs_hold
        FROM '{PDV}' d
        WHERE d.active = TRUE AND d.location_id IS NOT NULL
        GROUP BY d.machine_id, d.config_id
        HAVING SUM(d.paid_spins) > 1000
    )
    SELECT
        ms.machine_id,
        ms.config_id,
        ms.obs_hold,
        (1.0 - g.configured_rtp::DOUBLE) AS theo_hold,
        ms.total_spins,
        ms.total_coin_in,
        ms.total_house_win,
        g.payout_multiplier_variance::DOUBLE AS pmv,
        (ms.obs_hold - (1.0 - g.configured_rtp::DOUBLE)) / 
            NULLIF(SQRT(g.payout_multiplier_variance::DOUBLE) / NULLIF(SQRT(ms.total_spins::DOUBLE), 0), 0) AS z_score
    FROM machine_stats ms
    JOIN '{GM}' g USING (config_id)
    ORDER BY z_score ASC
""").fetchdf()

leaks = zscore_df[zscore_df['z_score'] < -2.58]
print(f"  {len(leaks)} machines with Z < -2.58 (payout leak suspects)")
for _, r in leaks.iterrows():
    print(f"  {r['machine_id']:10s} | Z={r['z_score']:>7.2f} | ObsHold={r['obs_hold']:.4f} | TheoHold={r['theo_hold']:.4f} | Spins={r['total_spins']:>10,}")

unlucky = zscore_df[(zscore_df['z_score'] >= -2.58) & (zscore_df['z_score'] < -1.96)]
print(f"\n  {len(unlucky)} machines with -2.58 <= Z < -1.96 (unlucky but within noise)")

normal = zscore_df[(zscore_df['z_score'] >= -1.96) & (zscore_df['z_score'] <= 1.96)]
print(f"  {len(normal)} machines with |Z| <= 1.96 (normal variance)")

hot = zscore_df[zscore_df['z_score'] > 2.58]
print(f"  {len(hot)} machines with Z > 2.58 (anomalously high hold)")

# ─── Loyalty Comp Program Shift ───
print("\n### Loyalty Comp Program Shift")
comp_monthly = con.execute(f"""
    SELECT 
        pp.period_month,
        COUNT(DISTINCT pp.player_id) AS unique_players,
        SUM(pp.theo_usd)::DOUBLE AS total_theo,
        SUM(pp.comp_cost_usd)::DOUBLE AS total_comp_cost,
        SUM(pp.comp_face_value_usd)::DOUBLE AS total_comp_face,
        SUM(pp.comps_redeemed) AS total_comps_redeemed,
        SUM(pp.points_earned) AS total_points_earned,
        SUM(pp.points_redeemed) AS total_points_redeemed,
        SUM(pp.comp_cost_usd)::DOUBLE / NULLIF(SUM(pp.theo_usd)::DOUBLE, 0) AS comp_reinvestment_rate,
        SUM(pp.points_earned)::DOUBLE / NULLIF(SUM(pp.theo_usd)::DOUBLE, 0) AS points_per_theo_dollar
    FROM '{PP}' pp
    GROUP BY pp.period_month
    ORDER BY pp.period_month
""").fetchdf()
print("  Month      | Players | Theo         | CompCost     | Reinvest% | Pts/Theo$")
for _, r in comp_monthly.iterrows():
    print(f"  {r['period_month']} | {r['unique_players']:>7,} | ${r['total_theo']:>11,.2f} | ${r['total_comp_cost']:>10,.2f} | {r['comp_reinvestment_rate']*100:>8.2f}% | {r['points_per_theo_dollar']:>8.2f}")

# ─── Loyalty Ledger deeper look ───
print("\n### Loyalty Ledger Monthly Breakdown")
ll_monthly = con.execute(f"""
    SELECT
        STRFTIME(event_at_utc, '%Y-%m') AS month,
        event_type,
        COUNT(*) AS events,
        SUM(points_delta) AS total_points,
        SUM(economic_cost_cents)::DOUBLE / 100.0 AS total_econ_cost,
        SUM(face_value_cents)::DOUBLE / 100.0 AS total_face_value
    FROM '{LL}'
    GROUP BY month, event_type
    ORDER BY month, event_type
""").fetchdf()
for _, r in ll_monthly.iterrows():
    print(f"  {r['month']} | {r['event_type']:8s} | Events: {r['events']:>8,} | Points: {r['total_points']:>12,} | EconCost: ${r['total_econ_cost']:>10,.2f} | FaceVal: ${r['total_face_value']:>10,.2f}")

# ─── Holdout Validation MAE ───
print("\n### Holdout Validation MAE (Constant Mean, Weekday Mean)")
prop_df = con.execute(f"""
    SELECT gaming_date, coin_in_usd::DOUBLE AS coin_in, local_weekday
    FROM '{PROP}'
    ORDER BY gaming_date
""").fetchdf()

train = prop_df[prop_df['gaming_date'] <= '2025-04-30']
test = prop_df[prop_df['gaming_date'] > '2025-04-30']

# Model 1: Constant Mean
const_mean = train['coin_in'].mean()
mae_const = np.mean(np.abs(test['coin_in'].values - const_mean))
print(f"  Constant Mean Baseline: ${const_mean:,.2f}")
print(f"  MAE (Constant Mean): ${mae_const:,.2f}")

# Model 2: Weekday Mean
weekday_means = train.groupby('local_weekday')['coin_in'].mean().to_dict()
test_pred_weekday = test['local_weekday'].map(weekday_means)
mae_weekday = np.mean(np.abs(test['coin_in'].values - test_pred_weekday.values))
print(f"  MAE (Weekday Mean): ${mae_weekday:,.2f}")

print(f"\n  Train period: {train['gaming_date'].min()} to {train['gaming_date'].max()} ({len(train)} days)")
print(f"  Test period:  {test['gaming_date'].min()} to {test['gaming_date'].max()} ({len(test)} days)")

# ─── Events ───
print("\n### Events Calendar")
events = con.execute(f"SELECT * FROM '{EVENTS}' ORDER BY start_date").fetchdf()
for _, r in events.iterrows():
    print(f"  {r['event_id']:15s} | {r['name']:35s} | {r['start_date']} to {r['end_date']} | {r['event_type']:20s} | {r['local_scope']}")

# ─── DST Check ───
print("\n### DST Day Check")
dst = con.execute(f"""
    SELECT gaming_date, scheduled_seconds, local_weekday
    FROM '{CAL}'
    WHERE scheduled_seconds != 86400
""").fetchdf()
for _, r in dst.iterrows():
    print(f"  {r['gaming_date']} ({r['local_weekday']}): {r['scheduled_seconds']} seconds = {r['scheduled_seconds']/3600:.1f} hours")

# ─── Off-floor count ───
print("\n### Off-Floor Row Count")
off_floor = con.execute(f"""
    SELECT 
        COUNT(*) AS total_rows,
        COUNT(*) FILTER (WHERE active = FALSE OR location_id IS NULL) AS off_floor,
        COUNT(*) FILTER (WHERE active = TRUE AND location_id IS NOT NULL) AS on_floor
    FROM '{PDV}'
""").fetchdf()
print(f"  Total: {off_floor['total_rows'].iloc[0]:,} | Off-floor: {off_floor['off_floor'].iloc[0]:,} | On-floor: {off_floor['on_floor'].iloc[0]:,}")

print("\n" + "=" * 80)
print("AUDIT COMPLETE")
print("=" * 80)

