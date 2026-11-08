"""
The Gilded Ace - DuckDB Data Access Layer
Queries all parquet data views with domain validations, DST safety, and ratio-of-sums rules.
"""

from typing import Optional, List
import duckdb
import pandas as pd
import streamlit as st


def get_connection() -> duckdb.Connection:
    """
    Initializes and returns an in-memory DuckDB connection.
    """
    return duckdb.connect()


def _format_date(val) -> Optional[str]:
    """Helper to convert date or datetime to YYYY-MM-DD string."""
    if val is None:
        return None
    return str(val)[:10]


@st.cache_data(ttl=600)
def get_machine_summary(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    zones: Optional[List[str]] = None,
    manufacturers: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Computes floor machine metrics over the selected period.
    Enforces active floor filter, DST-safe scheduled hours, and ratio-of-sums hold.
    """
    con = get_connection()
    conditions = ["d.active = TRUE", "d.location_id IS NOT NULL"]

    if date_start:
        conditions.append(f"d.gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"d.gaming_date <= '{_format_date(date_end)}'")
    if zones:
        escaped_zones = ", ".join(f"'{z}'" for z in zones)
        conditions.append(f"d.zone_name IN ({escaped_zones})")
    if manufacturers:
        escaped_mfg = ", ".join(f"'{m}'" for m in manufacturers)
        conditions.append(f"d.manufacturer IN ({escaped_mfg})")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT 
            d.machine_id,
            d.theme,
            d.manufacturer,
            d.zone_name,
            d.config_id,
            SUM(d.coin_in_usd)::FLOAT AS total_coin_in,
            SUM(d.house_win_usd)::FLOAT AS total_house_win,
            SUM(d.theo_usd)::FLOAT AS total_theo,
            SUM(d.available_hours)::FLOAT AS total_available_hours,
            (SUM(c.scheduled_seconds) / 3600.0)::FLOAT AS total_scheduled_hours,
            (SUM(d.available_hours) / NULLIF(SUM(c.scheduled_seconds) / 3600.0, 0))::FLOAT AS availability_ratio,
            (SUM(d.theo_usd) / NULLIF(SUM(d.available_hours), 0))::FLOAT AS theo_per_avail_hour,
            (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0))::FLOAT AS observed_hold,
            (SUM(d.house_win_usd) - SUM(d.theo_usd))::FLOAT AS luck_residual_usd,
            SUM(d.paid_spins)::BIGINT AS paid_spins
        FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
        JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
        WHERE {where_clause}
        GROUP BY d.machine_id, d.theme, d.manufacturer, d.zone_name, d.config_id
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_machine_z_scores(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Computes statistical Z-score of hold deviation for each machine.
    Formula: Z = (obs_hold - (1 - configured_rtp)) / (sqrt(payout_multiplier_variance) / sqrt(total_spins))
    """
    con = get_connection()
    conditions = ["d.active = TRUE", "d.location_id IS NOT NULL"]

    if date_start:
        conditions.append(f"d.gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"d.gaming_date <= '{_format_date(date_end)}'")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT 
            d.machine_id,
            d.theme,
            d.manufacturer,
            d.config_id,
            SUM(d.paid_spins)::BIGINT AS total_spins,
            SUM(d.coin_in_usd)::FLOAT AS total_coin_in,
            (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0))::FLOAT AS obs_hold,
            (1.0 - g.configured_rtp)::FLOAT AS theo_hold,
            g.payout_multiplier_variance::FLOAT AS payout_variance,
            (
                ( (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0)) - (1.0 - g.configured_rtp) ) /
                NULLIF((SQRT(g.payout_multiplier_variance) / SQRT(NULLIF(SUM(d.paid_spins), 0))), 0)
            )::FLOAT AS z_score
        FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
        JOIN 'data/2_machine_decision/game_math.parquet' g ON d.config_id = g.config_id
        WHERE {where_clause}
        GROUP BY d.machine_id, d.theme, d.manufacturer, d.config_id, g.configured_rtp, g.payout_multiplier_variance
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_naive_bottom10(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Naive Bottom 10: Ranked strictly by total SUM(house_win_usd) ASC.
    Demonstrates the fallacy of ignoring luck, exposure, and volatility.
    """
    con = get_connection()
    conditions = ["d.active = TRUE", "d.location_id IS NOT NULL"]

    if date_start:
        conditions.append(f"d.gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"d.gaming_date <= '{_format_date(date_end)}'")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT 
            d.machine_id,
            d.theme,
            d.manufacturer,
            d.zone_name,
            SUM(d.house_win_usd)::FLOAT AS house_win_usd,
            SUM(d.theo_usd)::FLOAT AS theo_usd,
            (SUM(d.house_win_usd) - SUM(d.theo_usd))::FLOAT AS luck_residual_usd,
            (SUM(d.available_hours) / NULLIF(SUM(c.scheduled_seconds) / 3600.0, 0))::FLOAT AS availability,
            (SUM(d.theo_usd) / NULLIF(SUM(d.available_hours), 0))::FLOAT AS theo_per_avail_hour,
            (
                ( (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0)) - (1.0 - g.configured_rtp) ) /
                NULLIF((SQRT(g.payout_multiplier_variance) / SQRT(NULLIF(SUM(d.paid_spins), 0))), 0)
            )::FLOAT AS z_score
        FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
        JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
        JOIN 'data/2_machine_decision/game_math.parquet' g ON d.config_id = g.config_id
        WHERE {where_clause}
        GROUP BY d.machine_id, d.theme, d.manufacturer, d.zone_name, g.configured_rtp, g.payout_multiplier_variance
        ORDER BY house_win_usd ASC
        LIMIT 10
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_true_bottom10(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    True Bottom 10: Ranked by demand efficiency SUM(theo_usd)/SUM(available_hours) ASC.
    Accounts for availability and exposure while stripping out short-term luck swings.
    """
    con = get_connection()
    conditions = ["d.active = TRUE", "d.location_id IS NOT NULL"]

    if date_start:
        conditions.append(f"d.gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"d.gaming_date <= '{_format_date(date_end)}'")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT 
            d.machine_id,
            d.theme,
            d.manufacturer,
            d.zone_name,
            SUM(d.house_win_usd)::FLOAT AS house_win_usd,
            SUM(d.theo_usd)::FLOAT AS theo_usd,
            (SUM(d.house_win_usd) - SUM(d.theo_usd))::FLOAT AS luck_residual_usd,
            (SUM(d.available_hours) / NULLIF(SUM(c.scheduled_seconds) / 3600.0, 0))::FLOAT AS availability,
            (SUM(d.theo_usd) / NULLIF(SUM(d.available_hours), 0))::FLOAT AS theo_per_avail_hour,
            (
                ( (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0)) - (1.0 - g.configured_rtp) ) /
                NULLIF((SQRT(g.payout_multiplier_variance) / SQRT(NULLIF(SUM(d.paid_spins), 0))), 0)
            )::FLOAT AS z_score
        FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
        JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
        JOIN 'data/2_machine_decision/game_math.parquet' g ON d.config_id = g.config_id
        WHERE {where_clause}
        GROUP BY d.machine_id, d.theme, d.manufacturer, d.zone_name, g.configured_rtp, g.payout_multiplier_variance
        ORDER BY theo_per_avail_hour ASC
        LIMIT 10
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_floor_map_data(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Joins physical slot layout (x_m, y_m) with aggregated machine performance metrics.
    Handles machines at their designated slot locations.
    """
    con = get_connection()
    conditions = ["d.active = TRUE", "d.location_id IS NOT NULL"]

    if date_start:
        conditions.append(f"d.gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"d.gaming_date <= '{_format_date(date_end)}'")

    where_clause = " AND ".join(conditions)

    query = f"""
        WITH machine_loc_agg AS (
            SELECT 
                d.machine_id,
                d.location_id,
                d.theme,
                d.manufacturer,
                d.zone_name,
                SUM(d.coin_in_usd)::FLOAT AS total_coin_in,
                SUM(d.house_win_usd)::FLOAT AS total_house_win,
                SUM(d.theo_usd)::FLOAT AS total_theo,
                SUM(d.available_hours)::FLOAT AS total_available_hours,
                (SUM(d.available_hours) / NULLIF(SUM(c.scheduled_seconds) / 3600.0, 0))::FLOAT AS availability_ratio,
                (SUM(d.theo_usd) / NULLIF(SUM(d.available_hours), 0))::FLOAT AS theo_per_avail_hour,
                (SUM(d.house_win_usd) - SUM(d.theo_usd))::FLOAT AS luck_residual_usd,
                (
                    ( (SUM(d.house_win_usd) / NULLIF(SUM(d.coin_in_usd), 0)) - (1.0 - g.configured_rtp) ) /
                    NULLIF((SQRT(g.payout_multiplier_variance) / SQRT(NULLIF(SUM(d.paid_spins), 0))), 0)
                )::FLOAT AS z_score
            FROM 'data/1_prepared_views/prepared_daily_view.parquet' d
            JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
            JOIN 'data/2_machine_decision/game_math.parquet' g ON d.config_id = g.config_id
            WHERE {where_clause}
            GROUP BY d.machine_id, d.location_id, d.theme, d.manufacturer, d.zone_name, g.configured_rtp, g.payout_multiplier_variance
        )
        SELECT 
            m.*,
            fl.x_m,
            fl.y_m,
            fl.bank_id,
            fl.zone_id
        FROM machine_loc_agg m
        JOIN 'data/2_machine_decision/floor_locations.parquet' fl ON m.location_id = fl.location_id
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_walkways() -> pd.DataFrame:
    """
    Returns walkways between floor zones, joined with coordinate locations for visualization.
    """
    con = get_connection()
    query = """
        SELECT 
            w.walkway_id,
            w.zone_a,
            w.zone_b,
            w.length_m,
            w.closed_from_utc,
            w.closed_to_utc,
            w.closure_reason,
            za.name AS zone_a_name,
            za.x_m AS za_x,
            za.y_m AS za_y,
            zb.name AS zone_b_name,
            zb.x_m AS zb_x,
            zb.y_m AS zb_y
        FROM 'data/2_machine_decision/floor_walkways.parquet' w
        LEFT JOIN 'data/2_machine_decision/floor_locations.parquet' za ON w.zone_a = za.location_id
        LEFT JOIN 'data/2_machine_decision/floor_locations.parquet' zb ON w.zone_b = zb.location_id
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_property_daily(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Returns floor-wide daily aggregate metrics from property_day.parquet.
    """
    con = get_connection()
    conditions = []
    if date_start:
        conditions.append(f"gaming_date >= '{_format_date(date_start)}'")
    if date_end:
        conditions.append(f"gaming_date <= '{_format_date(date_end)}'")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"""
        SELECT 
            gaming_date,
            local_weekday,
            events_active,
            active_machines,
            coin_in_usd::FLOAT AS coin_in_usd,
            payout_usd::FLOAT AS payout_usd,
            house_win_usd::FLOAT AS house_win_usd,
            theo_usd::FLOAT AS theo_usd,
            observed_hold::FLOAT AS observed_hold,
            available_machine_hours::FLOAT AS available_machine_hours,
            occupied_machine_hours::FLOAT AS occupied_machine_hours,
            carded_coin_in_share::FLOAT AS carded_coin_in_share,
            pos_cash_usd::FLOAT AS pos_cash_usd,
            pos_cogs_usd::FLOAT AS pos_cogs_usd,
            comp_face_value_usd::FLOAT AS comp_face_value_usd,
            comp_cost_usd::FLOAT AS comp_cost_usd,
            faults_opened::BIGINT AS faults_opened,
            incidents_reported::BIGINT AS incidents_reported,
            entrance_zone_entries_observed::BIGINT AS entrance_zone_entries_observed,
            total_zone_entries_observed::BIGINT AS total_zone_entries_observed,
            machine_supplied_costs_usd::FLOAT AS machine_supplied_costs_usd,
            tech_labor_cost_usd::FLOAT AS tech_labor_cost_usd,
            contribution_after_supplied_costs_usd::FLOAT AS contribution_after_supplied_costs_usd
        FROM 'data/1_prepared_views/property_day.parquet'
        {where_clause}
        ORDER BY gaming_date
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_events() -> pd.DataFrame:
    """
    Returns property and citywide events calendar.
    """
    con = get_connection()
    return con.execute("SELECT * FROM 'data/4_context/events.parquet' ORDER BY start_date").df()


@st.cache_data(ttl=600)
def get_zone_traffic(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Returns daily traffic per zone from zone_traffic_hourly.
    Filters to counter_status IN ('ok', 'partial') as offline status represents missing counts.
    """
    con = get_connection()
    conditions = ["counter_status IN ('ok', 'partial')"]

    if date_start:
        conditions.append(f"hour_start_local >= '{_format_date(date_start)} 00:00:00'")
    if date_end:
        conditions.append(f"hour_start_local <= '{_format_date(date_end)} 23:59:59'")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT 
            CAST(hour_start_local AS DATE) AS traffic_date,
            zone_id,
            SUM(entries_count)::BIGINT AS total_entries,
            COUNT(*)::INTEGER AS valid_counter_hours
        FROM 'data/4_context/zone_traffic_hourly.parquet'
        WHERE {where_clause}
        GROUP BY CAST(hour_start_local AS DATE), zone_id
        ORDER BY traffic_date, zone_id
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_downtime_breakdown(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
) -> pd.DataFrame:
    """
    Groups maintenance and fault operations by manufacturer and event_type.
    Calculates incident counts, downtime hours, and direct costs.
    """
    con = get_connection()
    conditions = []
    if date_start:
        conditions.append(f"o.opened_at_local >= '{_format_date(date_start)} 00:00:00'")
    if date_end:
        conditions.append(f"o.opened_at_local <= '{_format_date(date_end)} 23:59:59'")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
        SELECT 
            m.manufacturer,
            o.event_type,
            COUNT(*)::INTEGER AS incident_count,
            (SUM(EPOCH(o.available_at_utc) - EPOCH(o.opened_at_utc)) / 3600.0)::FLOAT AS total_downtime_hours,
            (SUM(o.direct_cost_cents) / 100.0)::FLOAT AS direct_cost_usd
        FROM 'data/2_machine_decision/operations.parquet' o
        JOIN 'data/2_machine_decision/machines.parquet' m USING (machine_id)
        {where_clause}
        GROUP BY m.manufacturer, o.event_type
        ORDER BY total_downtime_hours DESC
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_player_concentration(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    tier_filter: Optional[str] = None,
) -> dict:
    """
    Aggregates guest economics from player_period.
    Returns tier summary and individual player aggregates for Lorenz curve analysis.
    """
    con = get_connection()
    conditions = []
    if date_start:
        conditions.append(f"period_month >= '{_format_date(date_start)[:7]}'")
    if date_end:
        conditions.append(f"period_month <= '{_format_date(date_end)[:7]}'")
    if tier_filter and tier_filter != "All":
        conditions.append(f"opening_tier = '{tier_filter}'")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    tier_query = f"""
        SELECT 
            opening_tier,
            COUNT(DISTINCT player_id)::BIGINT AS player_count,
            SUM(tracked_coin_in_usd)::FLOAT AS total_coin_in,
            SUM(theo_usd)::FLOAT AS total_theo,
            SUM(tracked_net_usd)::FLOAT AS total_net_win,
            SUM(comps_redeemed)::BIGINT AS comps_redeemed,
            SUM(comp_cost_usd)::FLOAT AS total_comp_cost,
            SUM(points_earned)::BIGINT AS points_earned,
            SUM(points_redeemed)::BIGINT AS points_redeemed
        FROM 'data/1_prepared_views/player_period.parquet'
        {where_clause}
        GROUP BY opening_tier
        ORDER BY total_coin_in DESC
    """
    tier_df = con.execute(tier_query).df()

    player_query = f"""
        SELECT 
            player_id,
            opening_tier,
            SUM(tracked_coin_in_usd)::FLOAT AS total_coin_in,
            SUM(theo_usd)::FLOAT AS total_theo,
            SUM(tracked_net_usd)::FLOAT AS total_net_win
        FROM 'data/1_prepared_views/player_period.parquet'
        {where_clause}
        GROUP BY player_id, opening_tier
        ORDER BY total_coin_in ASC
    """
    players_df = con.execute(player_query).df()

    return {"tiers": tier_df, "players": players_df}


@st.cache_data(ttl=600)
def get_comp_trend() -> pd.DataFrame:
    """
    Returns monthly loyalty metrics combining player_period and loyalty_ledger.
    Tracks comp cost to theoretical win ratio and point award velocities.
    """
    con = get_connection()
    query = """
        WITH pp AS (
            SELECT 
                period_month AS month,
                SUM(tracked_coin_in_usd)::FLOAT AS tracked_coin_in_usd,
                SUM(theo_usd)::FLOAT AS theo_usd,
                SUM(comp_cost_usd)::FLOAT AS comp_cost_usd,
                SUM(points_earned)::BIGINT AS points_earned,
                SUM(points_redeemed)::BIGINT AS points_redeemed
            FROM 'data/1_prepared_views/player_period.parquet'
            GROUP BY period_month
        ),
        ll AS (
            SELECT 
                STRFTIME(event_at_utc, '%Y-%m') AS month,
                (SUM(face_value_cents) / 100.0)::FLOAT AS comp_face_value_usd,
                (SUM(economic_cost_cents) / 100.0)::FLOAT AS comp_economic_cost_usd
            FROM 'data/3_guests/loyalty_ledger.parquet'
            GROUP BY STRFTIME(event_at_utc, '%Y-%m')
        )
        SELECT 
            pp.month,
            pp.tracked_coin_in_usd,
            pp.theo_usd,
            pp.comp_cost_usd,
            pp.points_earned,
            pp.points_redeemed,
            COALESCE(ll.comp_face_value_usd, 0)::FLOAT AS comp_face_value_usd,
            COALESCE(ll.comp_economic_cost_usd, 0)::FLOAT AS comp_economic_cost_usd,
            (pp.comp_cost_usd / NULLIF(pp.theo_usd, 0))::FLOAT AS comp_to_theo_ratio,
            (pp.points_earned / NULLIF(pp.theo_usd, 0))::FLOAT AS points_per_theo_ratio
        FROM pp
        LEFT JOIN ll ON pp.month = ll.month
        ORDER BY pp.month
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_action_catalog() -> pd.DataFrame:
    """
    Returns the action catalog with unit costs, lead times, and capacity constraints.
    """
    con = get_connection()
    return con.execute("SELECT * FROM 'data/2_machine_decision/action_catalog.parquet'").df()


@st.cache_data(ttl=600)
def get_daily_for_forecast() -> pd.DataFrame:
    """
    Retrieves chronological property_day data joined with calendar metadata for ML modeling.
    """
    con = get_connection()
    query = """
        SELECT 
            p.gaming_date,
            p.local_weekday,
            p.events_active,
            p.coin_in_usd::FLOAT AS coin_in_usd,
            p.house_win_usd::FLOAT AS house_win_usd,
            p.theo_usd::FLOAT AS theo_usd,
            c.is_weekend,
            c.month
        FROM 'data/1_prepared_views/property_day.parquet' p
        JOIN 'data/2_machine_decision/calendar_day.parquet' c USING (gaming_date)
        ORDER BY p.gaming_date ASC
    """
    return con.execute(query).df()


@st.cache_data(ttl=600)
def get_machine_placements() -> pd.DataFrame:
    """
    Returns historical placement history, highlighting machines that were moved.
    """
    con = get_connection()
    query = """
        SELECT 
            p.placement_id,
            p.machine_id,
            p.location_id,
            p.config_id,
            p.effective_from_utc,
            p.effective_to_utc,
            m.theme,
            m.manufacturer,
            fl.bank_id,
            fl.zone_id,
            fl.x_m,
            fl.y_m
        FROM 'data/2_machine_decision/placements.parquet' p
        JOIN 'data/2_machine_decision/machines.parquet' m ON p.machine_id = m.machine_id
        JOIN 'data/2_machine_decision/floor_locations.parquet' fl ON p.location_id = fl.location_id
        ORDER BY p.machine_id, p.effective_from_utc
    """
    return con.execute(query).df()

