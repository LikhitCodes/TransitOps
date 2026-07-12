# TransitOps — Design System Reference
# Inspired by Mux.com's design language
# =========================================
# Use this file as the SINGLE SOURCE OF TRUTH for all frontend styling.
# Every color, font, spacing value, shadow, radius, and animation is defined here.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 1. COLOR PALETTE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1.1 — Base / Background Colors
These create the dark-mode dashboard foundation with subtle warmth.

| Token Name             | Hex       | RGB              | Usage |
|------------------------|-----------|------------------|-------|
| `--bg-base`            | `#111111` | `17, 17, 17`     | Root page background — the deepest dark layer |
| `--bg-surface`         | `#1a1a1a` | `26, 26, 26`     | Card backgrounds, sidebar, elevated panels on dark sections |
| `--bg-elevated`        | `#222222` | `34, 34, 34`     | Modals, dropdowns, popovers sitting above surface |
| `--bg-subtle`          | `#2a2a2a` | `42, 42, 42`     | Table row hover, input field backgrounds |
| `--bg-light`           | `#e8e3dc` | `232, 227, 220`  | Light section backgrounds (warm beige/cream — the Mux "light" panels) |
| `--bg-light-alt`       | `#f0ece6` | `240, 236, 230`  | Slightly lighter variant for alternating light sections |
| `--bg-white`           | `#ffffff` | `255, 255, 255`  | Pure white — testimonial cards, modals on light backgrounds |

### 1.2 — Primary Accent: Vivid Green
The signature Mux green. Use for: primary CTAs, success states, active indicators, "Available" status.

| Token Name                | Hex       | RGB              | Usage |
|---------------------------|-----------|------------------|-------|
| `--accent-green`          | `#00e05a` | `0, 224, 90`     | Primary action buttons, sign-up/CTA fills, active node dots |
| `--accent-green-hover`    | `#00c74f` | `0, 199, 79`     | Hover state for green buttons |
| `--accent-green-muted`    | `rgba(0, 224, 90, 0.12)` | — | Subtle green tint backgrounds (status badges, KPI card accents) |
| `--accent-green-glow`     | `rgba(0, 224, 90, 0.25)` | — | Box-shadow glow on hover for green elements |

### 1.3 — Secondary Accent: Vibrant Orange
Bold, energetic orange. Use for: secondary CTAs, urgent alerts, "In Shop" status, decorative elements.

| Token Name                | Hex       | RGB              | Usage |
|---------------------------|-----------|------------------|-------|
| `--accent-orange`         | `#ff6b00` | `255, 107, 0`    | Secondary buttons, large CTA banners, decorative circles |
| `--accent-orange-hover`   | `#e56000` | `229, 96, 0`     | Hover state |
| `--accent-orange-muted`   | `rgba(255, 107, 0, 0.12)` | — | Subtle orange tint backgrounds |
| `--accent-orange-glow`    | `rgba(255, 107, 0, 0.25)` | — | Box-shadow glow |

### 1.4 — Tertiary Accent: Golden Amber/Yellow
Warm gold. Use for: highlights, "warning" states, active category indicators, testimonial accents.

| Token Name                | Hex       | RGB              | Usage |
|---------------------------|-----------|------------------|-------|
| `--accent-amber`          | `#ffb800` | `255, 184, 0`    | Active list item highlight bars, warning badges, card accent headers |
| `--accent-amber-hover`    | `#e5a600` | `229, 166, 0`    | Hover state |
| `--accent-amber-muted`    | `rgba(255, 184, 0, 0.12)` | — | Subtle amber tint backgrounds |

### 1.5 — Info Accent: Electric Blue
Clean blue. Use for: links, info buttons, "On Trip" status, selected/focused states.

| Token Name                | Hex       | RGB              | Usage |
|---------------------------|-----------|------------------|-------|
| `--accent-blue`           | `#4285f4` | `66, 133, 244`   | Links, info buttons, "Pick a File" style CTAs, On Trip badges |
| `--accent-blue-hover`     | `#3574d4` | `53, 116, 212`   | Hover state |
| `--accent-blue-muted`     | `rgba(66, 133, 244, 0.12)` | — | Subtle blue tint backgrounds |

### 1.6 — Danger/Error: Red
For destructive actions, suspended status, critical alerts.

| Token Name                | Hex       | RGB              | Usage |
|---------------------------|-----------|------------------|-------|
| `--accent-red`            | `#ff3b3b` | `255, 59, 59`    | Delete buttons, error messages, Suspended status badge |
| `--accent-red-hover`      | `#e53535` | `229, 53, 53`    | Hover state |
| `--accent-red-muted`      | `rgba(255, 59, 59, 0.12)` | — | Error background tints |

### 1.7 — Text Colors

| Token Name             | Hex       | Usage |
|------------------------|-----------|-------|
| `--text-primary`       | `#ffffff` | Headings, primary text on dark backgrounds |
| `--text-secondary`     | `#a0a0a0` | Descriptions, secondary labels on dark backgrounds |
| `--text-muted`         | `#666666` | Placeholder text, disabled text, timestamps |
| `--text-on-light`      | `#1a1a1a` | Primary text on light/beige sections |
| `--text-on-light-sec`  | `#555555` | Secondary text on light sections |
| `--text-on-accent`     | `#111111` | Text on green/orange/amber buttons (dark on bright) |

### 1.8 — Border & Divider Colors

| Token Name             | Hex / Value                  | Usage |
|------------------------|------------------------------|-------|
| `--border-subtle`      | `rgba(255, 255, 255, 0.08)`  | Card borders on dark backgrounds, very subtle |
| `--border-default`     | `rgba(255, 255, 255, 0.12)`  | Input borders, table dividers on dark |
| `--border-strong`      | `rgba(255, 255, 255, 0.20)`  | Focused input borders, active card borders |
| `--border-light`       | `rgba(0, 0, 0, 0.08)`       | Card borders on light backgrounds |
| `--border-light-strong`| `rgba(0, 0, 0, 0.15)`       | Input borders on light sections |

### 1.9 — TransitOps Status Mapping

| Status       | Color Token         | Badge Background                  | Badge Text Color     |
|--------------|---------------------|-----------------------------------|----------------------|
| Available    | `--accent-green`    | `--accent-green-muted`            | `--accent-green`     |
| On Trip      | `--accent-blue`     | `--accent-blue-muted`             | `--accent-blue`      |
| In Shop      | `--accent-amber`    | `--accent-amber-muted`            | `--accent-amber`     |
| Retired      | `--text-muted`      | `rgba(102, 102, 102, 0.12)`       | `--text-muted`       |
| Suspended    | `--accent-red`      | `--accent-red-muted`              | `--accent-red`       |
| Off Duty     | `--accent-orange`   | `--accent-orange-muted`           | `--accent-orange`    |
| Draft        | `--text-secondary`  | `rgba(160, 160, 160, 0.10)`       | `--text-secondary`   |
| Dispatched   | `--accent-blue`     | `--accent-blue-muted`             | `--accent-blue`      |
| Completed    | `--accent-green`    | `--accent-green-muted`            | `--accent-green`     |
| Cancelled    | `--accent-red`      | `--accent-red-muted`              | `--accent-red`       |


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. TYPOGRAPHY
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 2.1 — Font Families

| Token Name             | Value | Usage |
|------------------------|-------|-------|
| `--font-primary`       | `'Inter', system-ui, -apple-system, sans-serif` | ALL body text, labels, inputs, descriptions |
| `--font-heading`       | `'Inter', system-ui, -apple-system, sans-serif` | Headings (same family, just heavier weights) |
| `--font-mono`          | `'JetBrains Mono', 'Fira Code', 'Consolas', monospace` | Code snippets, registration numbers, trip IDs, numeric data |

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap
```

### 2.2 — Type Scale

| Token Name           | Size    | Weight | Line-Height | Letter-Spacing | Usage |
|----------------------|---------|--------|-------------|----------------|-------|
| `--text-display`     | `48px`  | `800`  | `1.1`       | `-0.03em`      | Hero headings (login page title, big stats) |
| `--text-h1`          | `32px`  | `700`  | `1.2`       | `-0.02em`      | Page titles ("Vehicle Registry", "Dashboard") |
| `--text-h2`          | `24px`  | `700`  | `1.3`       | `-0.01em`      | Section headings, card titles |
| `--text-h3`          | `20px`  | `600`  | `1.4`       | `-0.01em`      | Sub-section headings |
| `--text-h4`          | `16px`  | `600`  | `1.4`       | `0`            | Card subtitles, table headers |
| `--text-body`        | `15px`  | `400`  | `1.6`       | `0`            | Default body text |
| `--text-body-sm`     | `13px`  | `400`  | `1.5`       | `0`            | Secondary descriptions, help text |
| `--text-caption`     | `11px`  | `500`  | `1.4`       | `0.04em`       | Badges, labels, metadata, timestamps |
| `--text-overline`    | `11px`  | `600`  | `1.2`       | `0.1em`        | Uppercase overlines ("THEY SAID IT BEST", nav links, section labels) |
| `--text-kpi-value`   | `36px`  | `800`  | `1.0`       | `-0.02em`      | Dashboard KPI numbers |
| `--text-kpi-label`   | `13px`  | `500`  | `1.4`       | `0.02em`       | KPI card labels beneath the value |

### 2.3 — Key Typography Rules (from Mux)
- **Navigation links**: Uppercase, letter-spacing `0.08em`, font-weight `500`, size `12px`
- **Button text**: Uppercase, letter-spacing `0.1em`, font-weight `600`, size `13px`
- **Large feature headings**: Very bold (800), tight letter-spacing, large size
- **Body text**: Regular weight (400), comfortable line-height (1.6)
- **Numeric/data values**: Use monospace font for registration numbers, trip IDs, costs, and odometer readings for alignment and readability


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 3. SPACING SYSTEM
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Base unit: `4px`. All spacing derives from this.

| Token Name       | Value  | Usage |
|------------------|--------|-------|
| `--space-1`      | `4px`  | Minimal internal padding (badge padding) |
| `--space-2`      | `8px`  | Tight padding (between icon and label) |
| `--space-3`      | `12px` | Default inner padding for small components |
| `--space-4`      | `16px` | Standard padding for cards, inputs |
| `--space-5`      | `20px` | Medium gap between elements |
| `--space-6`      | `24px` | Section inner padding |
| `--space-8`      | `32px` | Large card padding, section gaps |
| `--space-10`     | `40px` | Major section separation |
| `--space-12`     | `48px` | Page-level vertical spacing |
| `--space-16`     | `64px` | Hero section padding |
| `--space-20`     | `80px` | Top-level section padding (like Mux's large sections) |

### Layout Widths

| Token Name             | Value    | Usage |
|------------------------|----------|-------|
| `--sidebar-width`      | `260px`  | Collapsed sidebar narrow: `72px` |
| `--sidebar-collapsed`  | `72px`   | Collapsed state with icons only |
| `--topbar-height`      | `64px`   | Top navigation bar height |
| `--content-max-width`  | `1400px` | Max width of the main content area |
| `--modal-width-sm`     | `440px`  | Small modals (confirm dialogs) |
| `--modal-width-md`     | `600px`  | Medium modals (forms) |
| `--modal-width-lg`     | `800px`  | Large modals (detail views) |


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 4. BORDER RADIUS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mux uses a mix of sharp rectangles (dark cards) and full pills (buttons).

| Token Name         | Value   | Usage |
|--------------------|---------|-------|
| `--radius-none`    | `0px`   | Sharp-cornered dark feature cards ("BUILD", "VIDEO" blocks) |
| `--radius-sm`      | `6px`   | Input fields, small chips |
| `--radius-md`      | `10px`  | Table containers, dropdown menus |
| `--radius-lg`      | `14px`  | Dashboard cards, KPI panels |
| `--radius-xl`      | `20px`  | Modals, large cards, testimonial cards |
| `--radius-2xl`     | `28px`  | Large CTA banner sections |
| `--radius-pill`    | `999px` | Buttons, badges, status pills, nav pills — Mux's signature shape |


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 5. SHADOWS & ELEVATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Token Name              | Value | Usage |
|-------------------------|-------|-------|
| `--shadow-none`         | `none` | Flat cards on dark backgrounds (Mux keeps dark cards shadow-free) |
| `--shadow-sm`           | `0 1px 3px rgba(0, 0, 0, 0.5)` | Subtle depth for inputs |
| `--shadow-md`           | `0 4px 16px rgba(0, 0, 0, 0.4)` | Cards, dropdowns |
| `--shadow-lg`           | `0 8px 32px rgba(0, 0, 0, 0.5)` | Modals, floating panels |
| `--shadow-xl`           | `0 16px 48px rgba(0, 0, 0, 0.6)` | Large overlays |
| `--shadow-green-glow`   | `0 0 20px rgba(0, 224, 90, 0.3), 0 0 60px rgba(0, 224, 90, 0.1)` | Green CTA button hover glow |
| `--shadow-orange-glow`  | `0 0 20px rgba(255, 107, 0, 0.3), 0 0 60px rgba(255, 107, 0, 0.1)` | Orange element hover glow |
| `--shadow-card-hover`   | `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)` | Card lift on hover |

### Elevation Strategy (from Mux)
- **Dark sections**: Cards have NO shadow, only subtle borders (`--border-subtle`). Depth is communicated through background shade differences.
- **Light sections**: Cards use soft shadows for depth (e.g., testimonial cards).
- **Hover states**: Add a glow shadow + slight `translateY(-2px)` lift.
- **Modals**: Use `--shadow-xl` + a dark backdrop overlay `rgba(0, 0, 0, 0.7)`.


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 6. COMPONENT PATTERNS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 6.1 — Buttons

**Primary Button (Green — Filled Pill)**
```css
.btn-primary {
  background: var(--accent-green);
  color: var(--text-on-accent);
  border: none;
  border-radius: var(--radius-pill);
  padding: 12px 28px;
  font-family: var(--font-primary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  background: var(--accent-green-hover);
  box-shadow: var(--shadow-green-glow);
  transform: translateY(-1px);
}
```

**Secondary Button (Outlined Pill — like Mux's "START BUILDING" / "GET A DEMO")**
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-pill);
  padding: 12px 28px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--text-primary);
}
```

**Danger Button (Red Filled)**
```css
.btn-danger {
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  padding: 12px 28px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

**Ghost Button (Text-only with hover background)**
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}
```

### 6.2 — Cards

**Dark Card (Dashboard KPI, Sidebar Item)**
```css
.card-dark {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-dark:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

**Feature Card (Large black cards like Mux's "BUILD" / "VIDEO")**
```css
.card-feature {
  background: var(--bg-base);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-10) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**White Card (on light sections — like testimonials)**
```css
.card-white {
  background: var(--bg-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
```

### 6.3 — Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
/* Status dot before text */
.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge-available    { background: var(--accent-green-muted);  color: var(--accent-green); }
.badge-on-trip      { background: var(--accent-blue-muted);   color: var(--accent-blue); }
.badge-in-shop      { background: var(--accent-amber-muted);  color: var(--accent-amber); }
.badge-retired      { background: rgba(102,102,102,0.12);     color: var(--text-muted); }
.badge-suspended    { background: var(--accent-red-muted);    color: var(--accent-red); }
.badge-off-duty     { background: var(--accent-orange-muted); color: var(--accent-orange); }
```

### 6.4 — Input Fields

```css
.input-field {
  background: var(--bg-subtle);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
}
.input-field::placeholder {
  color: var(--text-muted);
}
.input-field:focus {
  border-color: var(--accent-green);
  box-shadow: 0 0 0 3px rgba(0, 224, 90, 0.1);
}
.input-field:hover:not(:focus) {
  border-color: var(--border-strong);
}

/* Input Label */
.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: block;
}
```

### 6.5 — Data Table

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.data-table thead th {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface);
  position: sticky;
  top: 0;
}
.data-table tbody td {
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.15s ease;
}
.data-table tbody tr:hover td {
  background: var(--bg-subtle);
}
/* Mono for IDs and numbers */
.data-table .cell-mono {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
}
```

### 6.6 — Sidebar Navigation

```css
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  padding: var(--space-4) 0;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 20px;
  margin: 2px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}
.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}
.sidebar-link.active {
  background: var(--accent-green-muted);
  color: var(--accent-green);
}

/* Active indicator bar (like Mux's amber left-bar on active items) */
.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--accent-green);
  border-radius: 0 3px 3px 0;
}
```

### 6.7 — KPI Card (Dashboard)

```css
.kpi-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.kpi-card::before {
  /* Left accent stripe — like Mux's colored indicator bars */
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.kpi-card--green::before  { background: var(--accent-green); }
.kpi-card--blue::before   { background: var(--accent-blue); }
.kpi-card--amber::before  { background: var(--accent-amber); }
.kpi-card--orange::before { background: var(--accent-orange); }

.kpi-value {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  font-family: var(--font-primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}
.kpi-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}
```

### 6.8 — Modal / Dialog

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
.modal-content {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  width: var(--modal-width-md);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}
.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
```

### 6.9 — Active List Item (Mux's category highlight pattern)

```css
/* Like the "Social media" active list item with amber bar */
.list-item {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 400;
  color: var(--text-on-light-sec);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}
.list-item.active {
  color: var(--accent-blue);
  border-left-color: var(--accent-amber);
  background: var(--accent-amber-muted);
  font-weight: 500;
}
```

### 6.10 — Grid Background Pattern (Mux's signature dark grid)

```css
.grid-bg {
  background-color: var(--bg-base);
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 7. ANIMATIONS & TRANSITIONS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 7.1 — Transition Tokens

| Token Name              | Value | Usage |
|-------------------------|-------|-------|
| `--ease-default`        | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard smooth easing |
| `--ease-spring`         | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/spring for modals, dropdowns |
| `--ease-in`             | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating motion |
| `--ease-out`            | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating motion |
| `--duration-fast`       | `150ms` | Hover states, color changes |
| `--duration-normal`     | `250ms` | Standard transitions |
| `--duration-slow`       | `400ms` | Page transitions, large element animations |

### 7.2 — Keyframe Animations

```css
/* Fade in (for overlays, page loads) */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Slide up (for modals, toasts) */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Slide in from left (for sidebar items appearing) */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Scale in (for badges, status dots) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}

/* KPI counter roll-up (number counting animation — done via JS) */
/* Use requestAnimationFrame to animate from 0 to target value over 800ms */

/* Pulse glow (for active/live status indicators) */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 224, 90, 0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(0, 224, 90, 0); }
}

/* Subtle float (for decorative circles like Mux's orange circles) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
}

/* Stagger animation for list items / cards */
/* Apply via JS: style.animationDelay = `${index * 60}ms` */
@keyframes staggerFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Spinning loader */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 7.3 — Micro-Interaction Patterns

| Element | Interaction | Effect |
|---------|-------------|--------|
| **Buttons** | Hover | `translateY(-1px)` + accent glow shadow |
| **Cards** | Hover | `translateY(-2px)` + border brightens + shadow appears |
| **Table Rows** | Hover | Background shifts to `--bg-subtle` |
| **Status Badges** | Load | `scaleIn` animation with 200ms delay |
| **KPI Numbers** | Page load | Animated counter from 0 → value over 800ms |
| **Sidebar Links** | Active | Green left-bar slides in with `scaleY` animation |
| **Modals** | Open | `slideUp` with spring easing |
| **Modals** | Close | `fadeOut` with standard easing |
| **Toast Notifications** | Appear | Slide in from top-right with `slideInLeft` |
| **Filter Dropdowns** | Open | `scaleIn` from top-left origin |
| **Page Transitions** | Navigate | Content area fades in with `fadeIn` (200ms) |
| **Decorative Circles** | Idle | `float` animation (3s infinite, like Mux's orange circles) |


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 8. CHART STYLING (Recharts)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Chart Color Palette (use these for data series)

| Index | Hex       | Usage |
|-------|-----------|-------|
| 0     | `#00e05a` | Primary data series (green) |
| 1     | `#4285f4` | Secondary series (blue) |
| 2     | `#ff6b00` | Tertiary series (orange) |
| 3     | `#ffb800` | Quaternary series (amber) |
| 4     | `#a855f7` | Fifth series (purple) |
| 5     | `#06b6d4` | Sixth series (cyan) |

### Chart Container Styling
```css
.chart-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}
```

### Recharts Theme Overrides
```
Grid stroke:        rgba(255, 255, 255, 0.06)
Axis tick color:    #666666
Axis line:          rgba(255, 255, 255, 0.08)
Tooltip background: #222222
Tooltip border:     rgba(255, 255, 255, 0.12)
Tooltip text:       #ffffff
Legend text:        #a0a0a0
```

### Area Chart Gradient Pattern
```jsx
<defs>
  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#00e05a" stopOpacity={0.3} />
    <stop offset="100%" stopColor="#00e05a" stopOpacity={0} />
  </linearGradient>
</defs>
<Area fill="url(#greenGradient)" stroke="#00e05a" strokeWidth={2} />
```


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 9. COMPLETE CSS VARIABLES BLOCK
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Copy this directly into your `index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* ── Fonts ── */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* ── Backgrounds ── */
  --bg-base:       #111111;
  --bg-surface:    #1a1a1a;
  --bg-elevated:   #222222;
  --bg-subtle:     #2a2a2a;
  --bg-light:      #e8e3dc;
  --bg-light-alt:  #f0ece6;
  --bg-white:      #ffffff;

  /* ── Accent: Green ── */
  --accent-green:        #00e05a;
  --accent-green-hover:  #00c74f;
  --accent-green-muted:  rgba(0, 224, 90, 0.12);
  --accent-green-glow:   rgba(0, 224, 90, 0.25);

  /* ── Accent: Orange ── */
  --accent-orange:       #ff6b00;
  --accent-orange-hover: #e56000;
  --accent-orange-muted: rgba(255, 107, 0, 0.12);
  --accent-orange-glow:  rgba(255, 107, 0, 0.25);

  /* ── Accent: Amber ── */
  --accent-amber:        #ffb800;
  --accent-amber-hover:  #e5a600;
  --accent-amber-muted:  rgba(255, 184, 0, 0.12);

  /* ── Accent: Blue ── */
  --accent-blue:         #4285f4;
  --accent-blue-hover:   #3574d4;
  --accent-blue-muted:   rgba(66, 133, 244, 0.12);

  /* ── Accent: Red ── */
  --accent-red:          #ff3b3b;
  --accent-red-hover:    #e53535;
  --accent-red-muted:    rgba(255, 59, 59, 0.12);

  /* ── Accent: Purple ── */
  --accent-purple:       #a855f7;
  --accent-purple-muted: rgba(168, 85, 247, 0.12);

  /* ── Accent: Cyan ── */
  --accent-cyan:         #06b6d4;
  --accent-cyan-muted:   rgba(6, 182, 212, 0.12);

  /* ── Text ── */
  --text-primary:      #ffffff;
  --text-secondary:    #a0a0a0;
  --text-muted:        #666666;
  --text-on-light:     #1a1a1a;
  --text-on-light-sec: #555555;
  --text-on-accent:    #111111;

  /* ── Borders ── */
  --border-subtle:       rgba(255, 255, 255, 0.08);
  --border-default:      rgba(255, 255, 255, 0.12);
  --border-strong:       rgba(255, 255, 255, 0.20);
  --border-light:        rgba(0, 0, 0, 0.08);
  --border-light-strong: rgba(0, 0, 0, 0.15);

  /* ── Radius ── */
  --radius-none: 0px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-2xl:  28px;
  --radius-pill: 999px;

  /* ── Shadows ── */
  --shadow-none:         none;
  --shadow-sm:           0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-md:           0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg:           0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-xl:           0 16px 48px rgba(0, 0, 0, 0.6);
  --shadow-green-glow:   0 0 20px rgba(0, 224, 90, 0.3), 0 0 60px rgba(0, 224, 90, 0.1);
  --shadow-orange-glow:  0 0 20px rgba(255, 107, 0, 0.3), 0 0 60px rgba(255, 107, 0, 0.1);
  --shadow-card-hover:   0 8px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1);

  /* ── Spacing ── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ── Layout ── */
  --sidebar-width:     260px;
  --sidebar-collapsed: 72px;
  --topbar-height:     64px;
  --content-max-width: 1400px;
  --modal-width-sm:    440px;
  --modal-width-md:    600px;
  --modal-width-lg:    800px;

  /* ── Transitions ── */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
}

html {
  font-family: var(--font-primary);
  background: var(--bg-base);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  line-height: 1.6;
}

a {
  color: var(--accent-blue);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}
a:hover {
  color: var(--accent-blue-hover);
}

::selection {
  background: var(--accent-green-muted);
  color: var(--accent-green);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-pill);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}
```


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 10. PAGE-SPECIFIC DESIGN NOTES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Login Page
- Background: `--bg-base` with the CSS grid pattern overlay
- Floating decorative circles (orange, green) with `float` animation — exactly like Mux's hero section
- Centered card: `--bg-surface` with `--border-subtle`, `--radius-xl`
- Brand name "TRANSITOPS" in display size, weight 800, with green accent on "OPS"
- Quick-access role cards: 4 small pill buttons below the form

### Dashboard
- Background: `--bg-base`
- KPI row: 6 `kpi-card` components in a CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`)
- Charts: 2×2 grid of `chart-container` elements
- Each KPI animates its number on load (counter from 0)

### Vehicle Registry
- Table wrapped in a `card-dark` container
- Registration numbers in `--font-mono`
- Status column uses status badges
- "Register Vehicle" button is `btn-primary` (green pill)
- Row click opens a slide-in detail panel (right side)

### Driver Management
- Card grid layout (`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`)
- Each driver card: avatar circle placeholder, name, license info, safety score ring
- Safety score ring: SVG circle with `stroke-dasharray` animation
  - Green stroke (≥85), Amber stroke (70–84), Red stroke (<70)

### Trip Planner
- Kanban columns: Draft | Dispatched | Completed | Cancelled
- Column headers have status-colored top border accent
- Trip cards: compact `card-dark` with route (Source → Dest), vehicle reg, driver name
- "New Trip" modal: form with smart dropdowns showing only eligible vehicles/drivers

### Maintenance
- Split layout: Active logs (left 60%) | History (right 40%)
- Active maintenance cards have an amber left accent bar
- "Close Maintenance" opens a compact form modal

### Reports
- Tab navigation across report types (pill-style tabs)
- Active tab: `--accent-green` text + underline
- Each report: headline stat + full-width chart + data table below
- CSV export: green outlined pill button in the top-right
