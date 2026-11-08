import duckdb

con = duckdb.connect()
files = [
    'data/1_prepared_views/prepared_daily_view.parquet',
    'data/1_prepared_views/property_day.parquet',
    'data/1_prepared_views/player_period.parquet',
    'data/2_machine_decision/calendar_day.parquet',
    'data/2_machine_decision/machines.parquet',
    'data/2_machine_decision/placements.parquet',
    'data/2_machine_decision/floor_locations.parquet',
    'data/2_machine_decision/floor_walkways.parquet',
    'data/2_machine_decision/game_math.parquet',
    'data/2_machine_decision/action_catalog.parquet',
    'data/2_machine_decision/operations.parquet',
    'data/2_machine_decision/cost_rules.parquet',
    'data/3_guests/loyalty_ledger.parquet',
    'data/3_guests/fnb_transactions.parquet',
    'data/4_context/zone_traffic_hourly.parquet',
    'data/4_context/events.parquet',
]

for f in files:
    try:
        info = con.execute(f"SELECT column_name, column_type FROM (DESCRIBE SELECT * FROM '{f}')").fetchall()
        cnt = con.execute(f"SELECT COUNT(*) FROM '{f}'").fetchone()[0]
        print(f'\n=== {f} ({cnt:,} rows) ===')
        for col, dtype in info:
            print(f'  {col:45s} {dtype}')
    except Exception as e:
        print(f'\n=== {f} ERROR: {e} ===')

