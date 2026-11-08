# The Gilded Ace: Floor Command Center 🎰
**Executive Casino Analytics & Slot Floor Optimization Platform**

Built for the **Dashboard Royale** analytics challenge, *The Gilded Ace: Floor Command Center* is an executive decision-support application designed for casino general managers and slot floor directors. It integrates **DuckDB**, **Plotly**, **Streamlit**, and **scikit-learn** using the luxury **Vegas Noir** dark theme to diagnose machine performance, isolate luck from demand, model floor traffic, and allocate a $100,000 capital improvement budget with stochastic risk validation.

---

## 🏛️ Architecture Overview

```
c:\Users\Ashmeet\Casino_Dashboard\
├── app.py                  # Main Streamlit command center entry point & 4 UI tabs
├── src/
│   ├── __init__.py         # Package initialization
│   ├── queries.py          # Cached DuckDB queries with domain rules & DST safety
│   ├── models.py           # ML time-series models (GBR, baselines) & Monte Carlo simulation
│   └── theme.py            # Vegas Noir design system, custom CSS styling & Plotly dark templates
├── start.bat               # 1-Click Launch Script (Windows)
├── start.sh                # 1-Click Launch Script (Linux/macOS)
├── requirements.txt        # Production Python dependencies
└── README.md               # System documentation & setup guide
```

---

## ⚙️ Core Analytical Rules & Engineering Principles

1. **Active Floor Isolation**: Queries strictly enforce `WHERE active = TRUE AND location_id IS NOT NULL` to exclude pre-install and post-retirement machine-days.
2. **Ratio-of-Sums Hold Calculations**: Observed hold is computed as `SUM(house_win_usd) / NULLIF(SUM(coin_in_usd), 0)` rather than averaging daily ratios, eliminating small-sample ratio distortion.
3. **DST-Safe Exposure Normalization**: Machine availability is calculated against `scheduled_seconds` joined from `calendar_day.parquet` (safely handling the 23-hour March 8, 2025 daylight-saving day).
4. **Statistical Process Control Funnel**: Evaluates machine hold deviation using Z-scores:
   $$Z = \frac{\text{Observed Hold} - (1 - \text{Configured RTP})}{\sqrt{\text{Payout Variance}} / \sqrt{\text{Total Spins}}}$$
   Machines with $Z < -2.58$ ($p < 0.01$) are triaged as payout leaks (`M-1158`, $Z = -4.05$) rather than poor demand.
5. **Comp Accounting Hygiene**: `comp_cost_usd` is recognized as already included within `linked_pos_cogs_usd`, preventing double-counting of guest reinvestment.
6. **Chronological Out-of-Time Validation**: ML time-series forecasting trains on **January 1 – April 30, 2025 (120 days)** and benchmarks out-of-sample on **May 1 – June 30, 2025 (61 days)** with no future leakage ($52.8k MAE for GBR).

---

## 🚀 Quickstart Launch

### 1. One-Click Launch (Windows)
In PowerShell or Command Prompt, run:
```powershell
.\start.bat
```

### 2. Manual Launch
```bash
python -m streamlit run app.py
```

Then open your browser to **http://localhost:8501**.

---

## 🎨 Visual Design ("Vegas Noir")
- **Obsidian Background**: `#0B0F19` with slate card panels (`#131B2E`) and brushed gold accents (`#D4AF37`).
- **Interactive Plotly Suite**: Dark-mode blueprints, scatter confidence funnels, macro demand overlays, and Monte Carlo distributions.
- **4 Stress-Test Tabs**:
  1. *🎰 Floor Map & Machine Triage*: GM's Naive Bottom 10 vs True Bottom 10, 2D Floor Layout, Volatility Funnel.
  2. *📊 Demand, Downtime & Guest Economics*: Daily macro demand, downtime costs, Lorenz curve, and comp drift.
  3. *🔮 Time-Series Validation Lab*: May–June holdout comparison (GBR vs Baselines).
  4. *💰 Budget War Room*: $100k allocator, Monte Carlo ROI distribution, and Claims Appendix.
