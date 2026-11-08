---
name: vegas-noir-ui
description: "UI theme tokens, Plotly dark-mode templates, 21st.dev MCP component integration workflow, and the 4 Judge Stress Test interface rules"
---

# Vegas Noir UI Theme & 21st.dev Component Architecture

## Color Palette (Colorblind-Safe)

| Token | Hex | Usage | Tailwind Class |
|---|---|---|---|
| `BG_OBSIDIAN` | `#0B0F19` | Page background | `bg-[#0B0F19]` |
| `CARD_SLATE` | `#131B2E` | Card / panel backgrounds | `bg-[#131B2E]/90 backdrop-blur-md border border-[#D4AF37]/20` |
| `GOLD` | `#D4AF37` | Borders, accents, highlights, KPI titles | `text-[#D4AF37]`, `border-[#D4AF37]` |
| `EMERALD` | `#10B981` | High structural theo/hr, positive trends | `text-[#10B981]`, `bg-[#10B981]/20` |
| `AMBER` | `#F59E0B` | Unlucky noise band, moderate warnings | `text-[#F59E0B]`, `bg-[#F59E0B]/20` |
| `CRIMSON` | `#F43F5E` | True leaks, high downtime, critical alerts | `text-[#F43F5E]`, `bg-[#F43F5E]/20` |
| `CYAN` | `#06B6D4` | Traffic, comps, secondary metrics | `text-[#06B6D4]`, `bg-[#06B6D4]/20` |
| `TEXT_LIGHT` | `#E2E8F0` | Primary text | `text-[#E2E8F0]` |
| `TEXT_DIM` | `#94A3B8` | Secondary / muted text | `text-[#94A3B8]` |
| `GRID_LINE` | `#1E293B` | Gridlines & subtle borders | `border-[#1E293B]` |

## 21st.dev MCP Component Workflow Rules

- **Rule 1: Always `search` first (Free Metadata)**:
  `search` queries on the 21st MCP (`https://21st.dev/api/mcp`) incur zero code retrieval deductions. Always run keyword searches (e.g. `"bento grid"`, `"kpi metric card"`, `"animated tabs"`, `"data table badge"`, `"sidebar filter"`) to locate component IDs and inspect visual blueprints.

- **Rule 2: Metering Awareness (`get_usage` before `get_component`)**:
  Check `get_usage` before pulling full code. Free tiers have 2 code retrievals per day (`get_component`), while paid tiers have unlimited access. Prioritize `get_component` for high-leverage centerpiece components:
  1. Executive Bento KPI Cards (`makviesainte/progress-metric-card` or custom Recharts Bento)
  2. Animated Tab Navigation & Viewport Morphing (`ibelick/animated-tabs`)
  3. Interactive Data Table / Allocator Pricing Sliders

- **Rule 3: Map Retrieved Components to Vegas Noir Tokens**:
  When adopting 21st `.tsx` components into the React + Tailwind project:
  - Replace default Slate/Zinc dark backgrounds with `#0B0F19` obsidian and `#131B2E` slate.
  - Apply the glassmorphism aesthetic: `bg-[#131B2E]/90 backdrop-blur-md border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]`.
  - Color-code action badges:
    - `🔴 Inspect Leak` -> `#F43F5E` (Crimson)
    - `🟠 Fix Downtime` -> `#F97316` (Deep Orange)
    - `🟡 Move / Replace` -> `#F59E0B` (Amber)
    - `🟢 Keep Unlucky` -> `#10B981` (Emerald)

## Judge Stress Test Interface Rules

### Test #1: "What are the worst 10 machines?"
- Show GM's Naive Bottom 10 (raw house_win_usd) vs True Bottom 10 (theo_usd / available_hours) side-by-side above the fold.
- Color-coded pill badges indicating mathematical triage reason: `🔴 Inspect-Leak` (Z < -2.58), `🟢 Keep-Unlucky` (|Z| <= 1.96), `🟡 Move/Replace-Low Demand`, `🟠 Fix-Downtime`.

### Test #2: "What's causing the floor to underperform?"
- Interactive drill-downs by Zone, Bank, Manufacturer, Guest Tier.
- Volatility funnel showing luck vs leak envelopes (95% and 99%).
- Downtime opportunity cost breakdown (lost available hours vs lost theo).

### Test #3: "How confident is your forecast?"
- MAE metric cards comparing Constant Mean ($218k), Weekday Mean ($68.7k), and GBR Challenger ($52.8k).
- Interactive Actual vs Predicted chart with out-of-time May-June holdout validation.

### Test #4: "How would you spend $100K?"
- Interactive action allocator with 30-day July cost formula: `quantity * (unit_cost_cents + recurring_cost_cents_per_day * max(0, 30 - lead_days)) / 100`.
- Incompatibility group enforcement (Comp Pilot vs Floor Comp Change) and 3-action-type max constraint.
- Monte Carlo P10/P50/P90 simulation distribution + Claims & Evidence Appendix.
