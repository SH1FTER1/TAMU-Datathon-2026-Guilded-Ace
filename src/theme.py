"""
The Gilded Ace - Vegas Noir Theme Module
Provides unified styling, color palette, CSS injections, and Plotly layout presets.
"""

# Color Palette Constants
BG_OBSIDIAN = "#0B0F19"
CARD_SLATE = "#131B2E"
GOLD = "#D4AF37"
EMERALD = "#10B981"
AMBER = "#F59E0B"
CRIMSON = "#F43F5E"
CYAN = "#06B6D4"
TEXT_LIGHT = "#E2E8F0"
TEXT_DIM = "#94A3B8"
GRID_LINE = "#1E293B"

# Secondary & Accent Tones
GOLD_MUTED = "rgba(212, 175, 55, 0.15)"
CARD_BORDER = "#1E293B"
HOVER_SLATE = "#1E293B"
PURPLE = "#8B5CF6"


def get_css() -> str:
    """
    Returns the complete Vegas Noir custom CSS stylesheet for Streamlit.
    """
    return f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

    /* Global Dark Noir Canvas */
    .stApp {{
        background-color: {BG_OBSIDIAN};
        color: {TEXT_LIGHT};
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }}

    /* Main Container Padding */
    .main .block-container {{
        padding-top: 1.8rem;
        padding-bottom: 3.5rem;
        max-width: 96%;
    }}

    /* Headers and Luxury Typography */
    h1, h2, h3, .casino-brand {{
        font-family: 'Cinzel', serif;
        letter-spacing: 0.05em;
        font-weight: 700;
        color: {GOLD};
    }}

    h1 {{
        font-size: 2.1rem;
        margin-bottom: 0.2rem;
        text-shadow: 0 0 20px rgba(212, 175, 55, 0.25);
    }}

    h2 {{
        font-size: 1.45rem;
        border-bottom: 1px solid {GRID_LINE};
        padding-bottom: 0.4rem;
        margin-top: 1.2rem;
        margin-bottom: 1.0rem;
    }}

    h3 {{
        font-size: 1.15rem;
        color: {TEXT_LIGHT};
    }}

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {{
        background-color: #0d1322 !important;
        border-right: 1px solid {GRID_LINE};
    }}

    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3 {{
        color: {GOLD};
    }}

    /* Metric Cards */
    div[data-testid="stMetric"] {{
        background-color: {CARD_SLATE};
        border: 1px solid {GRID_LINE};
        border-radius: 10px;
        padding: 14px 18px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }}

    div[data-testid="stMetric"]:hover {{
        border-color: {GOLD};
        transform: translateY(-2px);
    }}

    div[data-testid="stMetricLabel"] {{
        color: {TEXT_DIM} !important;
        font-size: 0.85rem !important;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }}

    div[data-testid="stMetricValue"] {{
        color: {TEXT_LIGHT} !important;
        font-family: 'Cinzel', serif;
        font-size: 1.7rem !important;
        font-weight: 700;
    }}

    /* Custom Styled Noir Cards */
    .noir-card {{
        background-color: {CARD_SLATE};
        border: 1px solid {GRID_LINE};
        border-radius: 12px;
        padding: 18px 22px;
        margin-bottom: 18px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
    }}

    .noir-card-gold {{
        border-left: 4px solid {GOLD};
    }}

    .noir-card-emerald {{
        border-left: 4px solid {EMERALD};
    }}

    .noir-card-crimson {{
        border-left: 4px solid {CRIMSON};
    }}

    .noir-card-amber {{
        border-left: 4px solid {AMBER};
    }}

    .noir-card-cyan {{
        border-left: 4px solid {CYAN};
    }}

    /* Action Badges */
    .badge {{
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }}

    .badge-unlucky {{
        background-color: rgba(16, 185, 129, 0.15);
        color: {EMERALD};
        border: 1px solid {EMERALD};
    }}

    .badge-leak {{
        background-color: rgba(244, 63, 94, 0.2);
        color: {CRIMSON};
        border: 1px solid {CRIMSON};
        animation: pulse-glow 2s infinite;
    }}

    .badge-demand {{
        background-color: rgba(245, 158, 11, 0.18);
        color: {AMBER};
        border: 1px solid {AMBER};
    }}

    .badge-downtime {{
        background-color: rgba(6, 182, 212, 0.18);
        color: {CYAN};
        border: 1px solid {CYAN};
    }}

    @keyframes pulse-glow {{
        0% {{ box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }}
        70% {{ box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }}
        100% {{ box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }}
    }}

    /* Custom Streamlit Tabs */
    .stTabs [data-baseweb="tab-list"] {{
        gap: 8px;
        background-color: {CARD_SLATE};
        padding: 6px;
        border-radius: 10px;
        border: 1px solid {GRID_LINE};
    }}

    .stTabs [data-baseweb="tab"] {{
        background-color: transparent !important;
        border-radius: 8px !important;
        color: {TEXT_DIM} !important;
        font-weight: 600 !important;
        padding: 10px 18px !important;
        border: none !important;
        transition: all 0.2s ease;
    }}

    .stTabs [data-baseweb="tab"]:hover {{
        color: {TEXT_LIGHT} !important;
        background-color: rgba(255, 255, 255, 0.04) !important;
    }}

    .stTabs [aria-selected="true"] {{
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05)) !important;
        color: {GOLD} !important;
        border: 1px solid {GOLD} !important;
        box-shadow: 0 0 12px rgba(212, 175, 55, 0.25) !important;
    }}

    /* Dataframe and Tables */
    div[data-testid="stDataFrame"] {{
        border: 1px solid {GRID_LINE};
        border-radius: 10px;
        overflow: hidden;
    }}

    /* Input Controls */
    .stSelectbox, .stMultiSelect, .stDateInput, .stNumberInput {{
        color: {TEXT_LIGHT};
    }}

    /* Progress Bar */
    .stProgress > div > div > div > div {{
        background-color: {GOLD} !important;
    }}

    /* Custom Scrollbars */
    ::-webkit-scrollbar {{
        width: 8px;
        height: 8px;
    }}
    ::-webkit-scrollbar-track {{
        background: {BG_OBSIDIAN};
    }}
    ::-webkit-scrollbar-thumb {{
        background: {GRID_LINE};
        border-radius: 4px;
    }}
    ::-webkit-scrollbar-thumb:hover {{
        background: {GOLD};
    }}
    </style>
    """


def get_plotly_layout() -> dict:
    """
    Returns a unified Plotly layout dictionary matching the Vegas Noir aesthetic.
    """
    return {
        "template": "plotly_dark",
        "paper_bgcolor": BG_OBSIDIAN,
        "plot_bgcolor": CARD_SLATE,
        "font": {
            "family": "Inter, system-ui, -apple-system, sans-serif",
            "color": TEXT_LIGHT,
            "size": 12,
        },
        "colorway": [
            GOLD,
            EMERALD,
            CYAN,
            CRIMSON,
            AMBER,
            PURPLE,
            "#38BDF8",
            "#F472B6",
            "#A78BFA",
        ],
        "xaxis": {
            "gridcolor": GRID_LINE,
            "zerolinecolor": GRID_LINE,
            "linecolor": GRID_LINE,
            "tickfont": {"color": TEXT_DIM, "size": 11},
            "title": {"font": {"color": TEXT_LIGHT, "size": 12}},
        },
        "yaxis": {
            "gridcolor": GRID_LINE,
            "zerolinecolor": GRID_LINE,
            "linecolor": GRID_LINE,
            "tickfont": {"color": TEXT_DIM, "size": 11},
            "title": {"font": {"color": TEXT_LIGHT, "size": 12}},
        },
        "hoverlabel": {
            "bgcolor": CARD_SLATE,
            "bordercolor": GOLD,
            "font": {
                "color": TEXT_LIGHT,
                "family": "Inter, system-ui, sans-serif",
                "size": 12,
            },
        },
        "legend": {
            "bgcolor": "rgba(19, 27, 46, 0.85)",
            "bordercolor": GRID_LINE,
            "borderwidth": 1,
            "font": {"color": TEXT_LIGHT, "size": 11},
        },
        "margin": {"t": 40, "b": 40, "l": 55, "r": 30},
    }


def apply_plotly_theme(fig):
    """
    Applies the Vegas Noir styling to any Plotly figure.
    """
    layout = get_plotly_layout()
    fig.update_layout(layout)
    return fig

